"use server";

import { clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { UserRole, EventType, EventChannel, EventStatus } from "@prisma/client";

// ==========================================
// HELPERS
// ==========================================

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

function revalidateUserLists() {
  revalidatePath("/lists/operadores");
  revalidatePath("/lists/administradores"); 
  revalidatePath("/lists/supervisores");
  revalidatePath("/lists/d2d");
}

function revalidateEventLists() {
  revalidatePath("/lists/vendas");
  revalidatePath("/lists/callbacks");
}

// ==========================================
// GETTERS (LISTAS PARA AS PÁGINAS)
// ==========================================

export async function getOperatorsList() {
  try {
    return await prisma.user.findMany({
      where: { role: 'OPERATOR', is_active: true },
      orderBy: { frst_name: 'asc' },
    });
  } catch (error) {
    console.error('Erro ao buscar operadores:', error);
    return [];
  }
}

export async function getAdministratorsList() {
  try {
    return await prisma.user.findMany({
      where: { 
        role: { in: ['ADMIN', 'SUPER_ADMIN'] },
        is_active: true 
      },
      orderBy: { frst_name: 'asc' },
    });
  } catch (error) {
    console.error('Erro ao buscar administradores:', error);
    return [];
  }
}

export async function getOperatorById(paramId: string | number) {
  try {
    const user = await findUser(paramId);
    if (!user) return null;
    return user;
  } catch (error) {
    return null;
  }
}

export async function getCallbacksList() {
  try {
    return await prisma.event.findMany({
      where: { type: 'CALLBACK' },
      include: { user: true, client: true },
      orderBy: { created_at: 'desc' },
    });
  } catch (error) {
    return [];
  }
}

// ==========================================
// CRUD UTILIZADORES (SYNC CLERK/PRISMA)
// ==========================================

export async function createSystemUser(data: {
  email: string;
  name: string;
  apelido: string;
  internalId: string;
  phone: string;
  role: UserRole;
}) {
  const passwordToUse = data.internalId;
  if (passwordToUse.length < 4) return { error: 'ID Interno deve ter pelo menos 4 caracteres' };

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ internalId: data.internalId }, { email: data.email }] }
  });
  if (existingUser) return { error: 'Utilizador já existe' };

  const clerk = await clerkClient();
  let newClerkUser = null;

  try {
    newClerkUser = await clerk.users.createUser({
      username: data.internalId,
      emailAddress: [data.email],
      password: passwordToUse,
      firstName: data.name,
      lastName: data.apelido,
      publicMetadata: { role: data.role.toLowerCase(), internalId: data.internalId },
      unsafeMetadata: {
        role: data.role.toLowerCase()
      },
      skipPasswordChecks: true,
    });

    await prisma.user.create({
      data: {
        userId: newClerkUser.id,
        email: data.email,
        internalId: data.internalId,
        frst_name: data.name,
        lst_name: data.apelido,
        phone: data.phone || null,
        role: data.role,
        is_active: true,
      }
    });

    revalidateUserLists();
    return { success: true, message: `Utilizador ${data.internalId} criado!` };
  } catch (error: any) {
    if (newClerkUser?.id) await clerk.users.deleteUser(newClerkUser.id);
    return { error: error.message || 'Erro ao criar utilizador' };
  }
}

export async function updateSystemUser(paramId: string | number, data: any) {
  try {
    const user = await findUser(paramId);
    if (!user) return { error: 'Utilizador não encontrado' };

    const clerk = await clerkClient();
    await clerk.users.updateUser(user.userId, { 
      firstName: data.name, 
      lastName: data.apelido,
      password: data.password || undefined 
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        frst_name: data.name,
        lst_name: data.apelido,
        email: data.email,
        phone: data.phone || null,
      },
    });

    revalidateUserLists();
    return { success: true, message: 'Atualizado com sucesso' };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteUserAction(userIdOrId: string | number) {
  try {
    const user = await findUser(userIdOrId);
    if (!user) return { error: 'Utilizador não encontrado' };

    const clerk = await clerkClient();
    await prisma.user.delete({ where: { id: user.id } });
    try { await clerk.users.deleteUser(user.userId); } catch (e) {}

    revalidateUserLists();
    return { success: true, message: 'Eliminado com sucesso' };
  } catch (error: any) {
    return { error: error.message };
  }
}

// ==========================================
// VENDAS / EVENTOS (🔧 CORRIGIDO)
// ==========================================

export async function getEventById(id: number) {
  return await prisma.event.findUnique({
    where: { id },
    include: { client: true, user: true }
  });
}

export async function createEvent(data: any) {
  try {
    // 🔍 Debug log
    console.log('📝 [createEvent] Recebido clerkUserId:', data.clerkUserId);
    
    // ✅ Validação robusta do clerkUserId
    if (!data.clerkUserId) {
      console.error('❌ [createEvent] clerkUserId está vazio!');
      return { error: 'ID de utilizador não fornecido' };
    }

    // ✅ Procura o user no Prisma usando o Clerk ID
    const user = await prisma.user.findUnique({ 
      where: { userId: data.clerkUserId } 
    });

    // 🔍 Debug log
    console.log('👤 [createEvent] User encontrado:', user ? `${user.frst_name} (${user.role})` : 'NULL');

    if (!user) {
      console.error('❌ [createEvent] Utilizador não encontrado no Prisma. ClerkID:', data.clerkUserId);
      return { error: 'Utilizador não encontrado na base de dados. Contacte o administrador.' };
    }

    // ✅ Verificação de permissões (opcional mas recomendado)
    const allowedRoles = ['OPERATOR', 'D2D', 'SUPERVISOR', 'ADMIN'];
    if (!allowedRoles.includes(user.role)) {
      console.error('❌ [createEvent] User sem permissão. Role:', user.role);
      return { error: 'Sem permissão para criar eventos' };
    }

    const eventId = `EVT_${Date.now()}`;

    // ✅ Validação dos dados do cliente
    if (!data.clientData?.frst_name || !data.clientData?.phone || !data.clientData?.address) {
      return { error: 'Dados do cliente incompletos' };
    }

    await prisma.$transaction(async (tx) => {
      const client = await tx.client.create({
        data: {
          frst_name: data.clientData.frst_name,
          lst_name: data.clientData.lst_name || null,
          phone: data.clientData.phone,
          email: data.clientData.email || null,
          address: data.clientData.address,
        }
      });

      await tx.event.create({
        data: {
          event_id: eventId,
          userId: user.id, // ✅ Usa o ID numérico do Prisma
          clientId: client.id,
          type: data.type,
          channel: data.channel,
          status: data.status,
          obs: data.obs || null,
          calledback_at: data.calledback_at || null,
        }
      });
    });

    console.log('✅ [createEvent] Event criado com sucesso:', eventId);
    revalidateEventLists();
    return { success: true, eventId };
  } catch (error: any) {
    console.error('❌ [createEvent] Erro:', error);
    return { error: error.message || 'Erro ao criar evento' };
  }
}

export async function updateEvent(eventId: number, data: any) {
  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return { error: 'Não encontrado' };

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
          calledback_at: data.calledback_at || null,
        }
      });
    });

    revalidateEventLists();
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteEventAction(eventId: number) {
  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return { error: 'Não encontrado' };

    await prisma.$transaction(async (tx) => {
      await tx.event.delete({ where: { id: eventId } });
      await tx.client.delete({ where: { id: event.clientId } });
    });

    revalidateEventLists();
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}