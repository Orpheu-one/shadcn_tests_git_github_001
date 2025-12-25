"use server"

import { clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { UserRole, EventType, EventChannel, EventStatus } from "@prisma/client";

// ==========================================
// HELPERS
// ==========================================

// Helper para encontrar user por id OU userId
async function findUser(paramId: string | number) {
  if (typeof paramId === 'string' && paramId.startsWith('user_')) {
    return await prisma.user.findUnique({ where: { userId: paramId } });
  }
  
  const numericId = typeof paramId === 'number' ? paramId : parseInt(paramId as string, 10);
  if (!isNaN(numericId)) {
    return await prisma.user.findUnique({ where: { id: numericId } });
  }
  
  return null;
}

// ==========================================
// BUSCA (Para Forms no modo Edit)
// ==========================================

export async function getOperatorById(paramId: string | number) {
  try {
    const user = await findUser(paramId);
    if (!user) return null;
    
    return {
      id: user.id,
      userId: user.userId,
      email: user.email,
      frst_name: user.frst_name,
      lst_name: user.lst_name,
      phone: user.phone,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
    };
  } catch (error) {
    console.error("❌ Erro ao buscar operador:", error);
    return null;
  }
}

export async function getEventById(id: number) {
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
            userId: true,
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
// UTILIZADORES - CREATE
// ==========================================

export async function createSystemUser(data: {
  email: string;
  name: string;
  apelido: string;
  phone?: string;
  password: string;
  role: UserRole;
}) {
  const clerk = await clerkClient();
  
  try {
    // 1. Gerar username
    const username = `${data.name.toLowerCase().replace(/\s+/g, '')}${Math.random().toString(36).slice(-4)}`;

    // 2. Criar no Clerk
    const newClerkUser = await clerk.users.createUser({
      username: username,
      emailAddresses: [{ emailAddress: data.email }],
      password: data.password,
      firstName: data.name,
      lastName: data.apelido || '',
      publicMetadata: {
        role: data.role.toLowerCase(),
      }
    });

    // 3. Criar no Prisma
    await prisma.user.create({
      data: {
        userId: newClerkUser.id,
        email: data.email,
        pwd: 'clerk_managed',
        frst_name: data.name,
        lst_name: data.apelido || '',
        phone: data.phone || null,
        role: data.role,
        is_active: true,
      }
    });

    revalidatePath("/lists/operadores");
    return { success: true, message: `Utilizador criado! Username: ${username}` };
    
  } catch (error: any) {
    console.error("❌ Erro ao criar user:", error);
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
    phone?: string;
    password?: string;
  }
) {
  const clerk = await clerkClient();
  
  try {
    // 1. Encontrar user
    const user = await findUser(paramId);
    if (!user) {
      return { error: 'Utilizador não encontrado' };
    }

    // 2. Atualizar no Clerk (se tiver password)
    try {
      const clerkUpdate: any = {
        firstName: data.name,
        lastName: data.apelido,
      };
      
      if (data.password && data.password.trim() !== '') {
        clerkUpdate.password = data.password;
      }
      
      await clerk.users.updateUser(user.userId, clerkUpdate);
    } catch (clerkError) {
      console.warn("⚠️ Erro ao atualizar Clerk (não crítico):", clerkError);
    }

    // 3. Atualizar no Prisma
    const updateData: any = {
      frst_name: data.name,
      lst_name: data.apelido,
      email: data.email,
      phone: data.phone || null,
    };

    if (data.password && data.password.trim() !== '') {
      updateData.pwd = data.password;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    revalidatePath("/lists/operadores");
    return { success: true, message: 'Utilizador atualizado com sucesso' };
    
  } catch (error: any) {
    console.error("❌ Erro ao atualizar user:", error);
    return { error: error.message || 'Erro ao atualizar utilizador' };
  }
}

// ==========================================
// UTILIZADORES - DELETE
// ==========================================

export async function deleteUserAction(paramId: string | number) {
  const clerk = await clerkClient();
  
  try {
    // 1. Encontrar user
    const user = await findUser(paramId);
    if (!user) {
      return { error: 'Utilizador não encontrado' };
    }

    // 2. Deletar do Prisma primeiro
    await prisma.user.delete({ where: { id: user.id } });

    // 3. Tentar deletar do Clerk (opcional)
    try {
      await clerk.users.deleteUser(user.userId);
    } catch (clerkError) {
      console.warn("⚠️ Erro ao deletar do Clerk (não crítico)");
    }

    revalidatePath("/lists/operadores");
    return { success: true, message: 'Utilizador eliminado com sucesso' };
    
  } catch (error: any) {
    console.error("❌ Erro ao deletar user:", error);
    return { error: error.message || 'Erro ao eliminar utilizador' };
  }
}

// ==========================================
// EVENTOS (VENDAS) - CREATE
// ==========================================

export async function createEvent(data: {
  userId: number;
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
  try {
    // 1. Gerar clientId único
    const clientId = `CLI_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    
    // 2. Gerar eventId único
    const eventId = `EVT_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    // 3. Criar client e event numa transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar cliente
      const client = await tx.client.create({
        data: {
          clientId: clientId,
          frst_name: data.clientData.frst_name,
          lst_name: data.clientData.lst_name || '',
          phone: data.clientData.phone,
          email: data.clientData.email || null,
          address: data.clientData.address,
        }
      });

      // Criar evento
      const event = await tx.event.create({
        data: {
          event_id: eventId,
          userId: data.userId,
          clientId: client.id,
          type: data.type,
          channel: data.channel,
          status: data.status,
          obs: data.obs || null,
        }
      });

      return { client, event };
    });

    revalidatePath("/lists/vendas");
    return { success: true, data: result, message: 'Venda criada com sucesso' };
    
  } catch (error: any) {
    console.error("❌ Erro ao criar evento:", error);
    return { error: error.message || 'Erro ao criar venda' };
  }
}

// ==========================================
// EVENTOS (VENDAS) - UPDATE
// ==========================================

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
  try {
    // Buscar evento para pegar clientId
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { clientId: true }
    });

    if (!event) {
      return { error: 'Evento não encontrado' };
    }

    // Atualizar numa transação
    await prisma.$transaction(async (tx) => {
      // Atualizar cliente
      await tx.client.update({
        where: { id: event.clientId },
        data: {
          frst_name: data.clientData.frst_name,
          lst_name: data.clientData.lst_name || '',
          phone: data.clientData.phone,
          email: data.clientData.email || null,
          address: data.clientData.address,
        }
      });

      // Atualizar evento
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

    revalidatePath("/lists/vendas");
    return { success: true, message: 'Venda atualizada com sucesso' };
    
  } catch (error: any) {
    console.error("❌ Erro ao atualizar evento:", error);
    return { error: error.message || 'Erro ao atualizar venda' };
  }
}

// ==========================================
// EVENTOS (VENDAS) - DELETE
// ==========================================

export async function deleteEventAction(eventId: number) {
  try {
    // Buscar evento para pegar clientId
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { clientId: true }
    });

    if (!event) {
      return { error: 'Evento não encontrado' };
    }

    // Deletar numa transação (evento primeiro, depois cliente)
    await prisma.$transaction(async (tx) => {
      await tx.event.delete({ where: { id: eventId } });
      await tx.client.delete({ where: { id: event.clientId } });
    });

    revalidatePath("/lists/vendas");
    return { success: true, message: 'Venda eliminada com sucesso' };
    
  } catch (error: any) {
    console.error("❌ Erro ao deletar evento:", error);
    return { error: error.message || 'Erro ao eliminar venda' };
  }
}