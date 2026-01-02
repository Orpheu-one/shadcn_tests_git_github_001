"use server"

import { clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { UserRole, EventType, EventChannel, EventStatus } from "@prisma/client";

// ==========================================
// HELPERS
// ==========================================

// Helper robusto para encontrar user por id (int) OU userId (string 'user_...')
async function findUser(paramId: string | number) {
  // Se for uma string que começa por 'user_', é o ID do Clerk
  if (typeof paramId === 'string' && paramId.startsWith('user_')) {
    return await prisma.user.findUnique({ where: { userId: paramId } });
  }
  
  // Caso contrário, tentamos converter para número (ID da DB)
  const numericId = typeof paramId === 'number' ? paramId : parseInt(paramId as string, 10);
  if (!isNaN(numericId)) {
    return await prisma.user.findUnique({ where: { id: numericId } });
  }
  
  return null;
}

// ==========================================
// BUSCAR OPERADORES
// ==========================================

export async function getOperatorsList() {
  try {
    const operators = await prisma.user.findMany({
      // Podes remover o filtro is_active se quiseres ver todos
      where: { is_active: true },
      orderBy: { frst_name: 'asc' },
    });
    return operators;
  } catch (error) {
    console.error('❌ Erro ao buscar operadores:', error);
    return [];
  }
}

export async function getOperatorById(paramId: string | number) {
  try {
    const user = await findUser(paramId);
    if (!user) return null;
    
    // Retorna objeto plano para o componente Client
    return {
      id: user.id,
      userId: user.userId,
      email: user.email,
      internalId: user.internalId,
      frst_name: user.frst_name,
      lst_name: user.lst_name,
      phone: user.phone,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at.toISOString(), // Serializar data para evitar avisos
    };
  } catch (error) {
    console.error("❌ Erro ao buscar operador:", error);
    return null;
  }
}

// Manter getEventById inalterado conforme pedido (omitido aqui para brevidade, assume que está igual)
export async function getEventById(id: number) {
  // ... (o teu código original do getEventById fica aqui) ...
   try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            frst_name: true,
            lst_name: true,
            email: true,
            phone: true,
            address: true,
          }
        },
        user: {
          select: {
            id: true,
            internalId: true,
            frst_name: true,
            lst_name: true,
            role: true,
          }
        }
      }
    });

    if (!event) return null;

    return {
      eventId: event.id,
      eventIdString: event.event_id,
      createdAt: event.created_at,
      type: event.type,
      channel: event.channel,
      status: event.status,
      obs: event.obs,
      operator: event.user,
      client: event.client,
    };
  } catch (error) {
    console.error("❌ Erro ao buscar evento:", error);
    return null;
  }
}

// ==========================================
// UTILIZADORES - CREATE (CORRIGIDO)
// ==========================================

export async function createSystemUser(data: {
  email: string;
  name: string;
  apelido: string;
  internalId: string;
  phone: string;
  role: UserRole;
  // Password removida dos argumentos pq será igual ao internalId
}) {
  console.log("🚀 [SERVER ACTION] createSystemUser:", data.internalId);
  
  // 1. Definição da Password (Regra: Igual ao Internal ID)
  // O Internal ID deve vir já com 4 letras maiúsculas do Form
  const passwordToUse = data.internalId;

  // 2. Validação de Segurança Básica
  if (passwordToUse.length < 4) {
    return { error: 'ID Interno/Password deve ter 4 caracteres' };
  }

  // 3. Verificar Duplicados na DB antes de chamar o Clerk
  const existingUser = await prisma.user.findFirst({
    where: { 
      OR: [
        { internalId: data.internalId },
        { email: data.email }
      ]
    }
  });

  if (existingUser) {
    return { error: 'Utilizador (Email ou ID) já existe no sistema' };
  }

  const clerk = await clerkClient();
  let newClerkUser = null;

  try {
    // 4. Criar no Clerk
    console.log("📝 A criar no Clerk...");
    
    // NOTA: Se o Clerk der erro aqui dizendo "Password too short", 
    // terás de mudar a definição "Minimum length" no Dashboard do Clerk para 4.
    newClerkUser = await clerk.users.createUser({
      username: data.internalId, // Username = ID (ex: ABCD)
      emailAddress: [data.email],
      password: passwordToUse,   // Password = ID (ex: ABCD)
      firstName: data.name,
      lastName: data.apelido || '',
      publicMetadata: {
        role: data.role.toLowerCase(),
        internalId: data.internalId,
      },
      skipPasswordChecks: true, // Tenta forçar o bypass (nem sempre funciona dependendo da instância)
      skipPasswordRequirement: true, 
    });

    console.log("✅ Clerk user criado:", newClerkUser.id);

    // 5. Criar na Base de Dados (PRISMA)
    const dbUser = await prisma.user.create({
      data: {
        userId: newClerkUser.id, // O elo de ligação
        email: data.email,
        internalId: data.internalId,
        frst_name: data.name,
        lst_name: data.apelido || '',
        phone: data.phone || null,
        role: data.role,
        is_active: true,
      }
    });

    console.log("✅ DB user criado:", dbUser.id);
    
    revalidatePath("/lists/operadores");
    return { success: true, message: `Utilizador ${data.internalId} criado com sucesso!` };

  } catch (error: any) {
    console.error("❌ Erro no processo de criação:", error);

    // ============================================================
    // ROLLBACK AUTOMÁTICO (Sync Solution)
    // Se falhou no Prisma mas criou no Clerk, apagamos do Clerk
    // ============================================================
    if (newClerkUser?.id) {
      console.warn("⚠️ A executar Rollback: Apagando utilizador do Clerk devido a erro na DB...");
      try {
        await clerk.users.deleteUser(newClerkUser.id);
        console.log("✅ Rollback concluído: Clerk user apagado.");
      } catch (rollbackError) {
        console.error("❌ FALHA CRÍTICA NO ROLLBACK:", rollbackError);
      }
    }

    // Tratamento de mensagens de erro do Clerk
    if (error.errors) {
      const msgs = error.errors.map((e: any) => e.message).join(', ');
      return { error: `Clerk Error: ${msgs}` };
    }

    return { error: error.message || 'Erro ao criar utilizador' };
  }
}

// ==========================================
// UTILIZADORES - UPDATE
// ==========================================

export async function updateSystemUser(
  paramId: string | number, 
  data: {
    name: string;
    apelido: string;
    email: string;
    phone: string;
    password?: string;
  }
) {
  // ... (código existente mantido, apenas garantir que usa findUser) ...
   console.log("🚀 [SERVER ACTION] updateSystemUser called for:", paramId);
  try {
    const user = await findUser(paramId);
    if (!user) {
      return { error: 'Utilizador não encontrado' };
    }

    console.log("📝 Updating user in Clerk...");

    const clerk = await clerkClient();

    const clerkUpdate: any = {
      firstName: data.name,
      lastName: data.apelido,
    };
    if (data.password && data.password.trim() !== '') {
      clerkUpdate.password = data.password;
    }
    
    // Usamos o userId (user_...) para falar com o Clerk
    await clerk.users.updateUser(user.userId, clerkUpdate);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        frst_name: data.name,
        lst_name: data.apelido,
        email: data.email,
        phone: data.phone || null,
      },
    });

    revalidatePath("/lists/operadores");
    return { success: true, message: 'Utilizador atualizado com sucesso' };
  } catch (error: any) {
    console.error("❌ Erro ao atualizar user:", error);
    return { error: error.message || 'Erro ao atualizar utilizador' };
  }
}

// ==========================================
// UTILIZADORES - DELETE (CORRIGIDO)
// ==========================================

export async function deleteUserAction(userIdOrId: string | number) {
  console.log("🚀 [SERVER ACTION] Delete solicitado para:", userIdOrId);
  
  try {
    // 1. Encontrar o utilizador PRIMEIRO para garantir que temos os IDs certos
    const user = await findUser(userIdOrId);

    if (!user) {
      console.log("❌ Utilizador não encontrado na DB para:", userIdOrId);
      return { error: 'Utilizador não encontrado' };
    }

    console.log(`📝 A eliminar: ${user.frst_name} (DB: ${user.id} | Clerk: ${user.userId})`);

    const clerk = await clerkClient();

    // 2. Apagar da DB primeiro (evita problemas de constraints)
    await prisma.user.delete({ where: { id: user.id } });
    console.log("✅ Utilizador eliminado da DB");

    // 3. Apagar do Clerk
    try {
      await clerk.users.deleteUser(user.userId);
      console.log("✅ Utilizador eliminado do Clerk");
    } catch (clerkError: any) {
      // Se o user já não existir no Clerk, não faz mal, prosseguimos
      console.warn("⚠️ Aviso Clerk Delete:", clerkError.message);
    }

    revalidatePath("/lists/operadores");
    return { success: true, message: 'Utilizador eliminado com sucesso' };
  } catch (error: any) {
    console.error("❌ Erro fatal ao deletar:", error);
    return { error: error.message || 'Erro ao eliminar utilizador' };
  }
}

// As funções createEvent, updateEvent, deleteEventAction mantêm-se iguais
// ... (código existente das Vendas) ...
export async function createEvent(data: {
  clerkUserId: string;
  clientData: {
    frst_name: string;
    lst_name: string;
    phone: string;
    email?: string;
    address: string;
  };
  type: EventType;
  channel: EventChannel;
  status: EventStatus;
  obs?: string;
}) {
  console.log("🚀 [SERVER ACTION] createEvent called for userId:", data.clerkUserId);

  try {
    const user = await prisma.user.findUnique({
      where: { userId: data.clerkUserId }
    });

    if (!user) {
      console.log("❌ User not found:", data.clerkUserId);
      return { error: 'Utilizador não encontrado na base de dados' };
    }

    console.log("✅ Found user:", user.id, user.frst_name);

    const eventId = `EVT_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const result = await prisma.$transaction(async (tx) => {
      const client = await tx.client.create({
        data: {
          frst_name: data.clientData.frst_name,
          lst_name: data.clientData.lst_name || null,
          phone: data.clientData.phone,
          email: data.clientData.email || null,
          address: data.clientData.address,
        }
      });

      const event = await tx.event.create({
        data: {
          event_id: eventId,
          userId: user.id,
          clientId: client.id,
          type: data.type,
          channel: data.channel,
          status: data.status,
          obs: data.obs || null,
        }
      });

      return { client, event };
    });

    console.log("✅ Event created:", result.event.id);

    revalidatePath("/lists/vendas");
    return { success: true, message: 'Venda criada com sucesso' };
  } catch (error: any) {
    console.error("❌ Erro ao criar evento:", error);
    return { error: error.message || 'Erro ao criar venda' };
  }
}

export async function updateEvent(
  eventId: number,
  data: {
    clientData: {
      frst_name: string;
      lst_name: string;
      phone: string;
      email?: string;
      address: string;
    };
    type: EventType;
    channel: EventChannel;
    status: EventStatus;
    obs?: string;
  }
) {
  console.log("🚀 [SERVER ACTION] updateEvent called for:", eventId);

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { clientId: true }
    });

    if (!event) {
      return { error: 'Evento não encontrado' };
    }

    await prisma.$transaction(async (tx) => {
      await tx.client.update({
        where: { id: event.clientId },
        data: {
          frst_name: data.clientData.frst_name,
          lst_name: data.clientData.lst_name || null,
          phone: data.clientData.phone,
          email: data.clientData.email || null,
          address: data.clientData.address,
        }
      });

      await tx.event.update({
        where: { id: eventId },
        data: {
          type: data.type,
          channel: data.channel,
          status: data.status,
          obs: data.obs || null,
        }
      });
    });

    console.log("✅ Event updated");

    revalidatePath("/lists/vendas");
    return { success: true, message: 'Venda atualizada com sucesso' };
  } catch (error: any) {
    console.error("❌ Erro ao atualizar evento:", error);
    return { error: error.message || 'Erro ao atualizar venda' };
  }
}

export async function deleteEventAction(eventId: number) {
  console.log("🚀 [SERVER ACTION] deleteEventAction called for:", eventId);

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        client: true,
        user: true,
      }
    });

    if (!event) {
      return { error: 'Evento não encontrado' };
    }

    console.log("📝 Deleting event:", event.event_id, "Client:", event.client.frst_name);

    await prisma.$transaction(async (tx) => {
      await tx.event.delete({ where: { id: eventId } });
      await tx.client.delete({ where: { id: event.clientId } });
    });

    console.log("✅ Event and client deleted");

    revalidatePath("/lists/vendas");
    return { success: true, message: 'Venda eliminada com sucesso' };
  } catch (error: any) {
    console.error("❌ Erro ao deletar evento:", error);
    return { error: error.message || 'Erro ao eliminar venda' };
  }
}