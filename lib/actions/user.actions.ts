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
    return user; // Retorna o objeto completo do Prisma para não quebrar a tipagem da tua página
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
// VENDAS / EVENTOS
// ==========================================

export async function getEventById(id: number) {
  return await prisma.event.findUnique({
    where: { id },
    include: { client: true, user: true }
  });
}

export async function createEvent(data: any) {
  try {
    const user = await prisma.user.findUnique({ where: { userId: data.clerkUserId } });
    if (!user) return { error: 'Utilizador não encontrado' };

    const eventId = `EVT_${Date.now()}`;

    await prisma.$transaction(async (tx) => {
      const client = await tx.client.create({
        data: {
          frst_name: data.clientData.frst_name,
          lst_name: data.clientData.lst_name,
          phone: data.clientData.phone,
          email: data.clientData.email,
          address: data.clientData.address,
        }
      });

      await tx.event.create({
        data: {
          event_id: eventId,
          userId: user.id,
          clientId: client.id,
          type: data.type,
          channel: data.channel,
          status: data.status,
          obs: data.obs,
          calledback_at: data.calledback_at,
        }
      });
    });

    revalidateEventLists();
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateEvent(eventId: number, data: any) {
  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return { error: 'Não encontrado' };

    await prisma.$transaction(async (tx) => {
      await tx.client.update({
        where: { id: event.clientId },
        data: data.clientData
      });
      await tx.event.update({
        where: { id: eventId },
        data: {
          type: data.type,
          channel: data.channel,
          status: data.status,
          obs: data.obs,
          calledback_at: data.calledback_at,
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