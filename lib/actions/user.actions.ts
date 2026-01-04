"use server"

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

// ==========================================
// OPERADORES (GET)
// ==========================================

export async function getOperatorsList() {
  try {
    return await prisma.user.findMany({
      where: { is_active: true },
      orderBy: { frst_name: 'asc' },
    });
  } catch (error) {
    console.error('❌ Erro ao buscar operadores:', error);
    return [];
  }
}

export async function getOperatorById(paramId: string | number) {
  try {
    const user = await findUser(paramId);
    if (!user) return null;
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
      created_at: user.created_at.toISOString(),
    };
  } catch (error) {
    console.error("❌ Erro ao buscar operador:", error);
    return null;
  }
}

// ==========================================
// OPERADORES (CRUD SISTEMA)
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
  if (passwordToUse.length < 4) return { error: 'ID Interno deve ter 4 caracteres' };

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
      lastName: data.apelido || '',
      publicMetadata: { role: data.role.toLowerCase(), internalId: data.internalId },
      skipPasswordChecks: true,
      skipPasswordRequirement: true, 
    });

    await prisma.user.create({
      data: {
        userId: newClerkUser.id,
        email: data.email,
        internalId: data.internalId,
        frst_name: data.name,
        lst_name: data.apelido || '',
        phone: data.phone || null,
        role: data.role,
        is_active: true,
      }
    });
    revalidatePath("/lists/operadores");
    return { success: true, message: `Utilizador ${data.internalId} criado!` };

  } catch (error: any) {
    if (newClerkUser?.id) {
      try { await clerk.users.deleteUser(newClerkUser.id); } catch (e) {}
    }
    return { error: error.message || 'Erro ao criar utilizador' };
  }
}

export async function updateSystemUser(paramId: string | number, data: any) {
  try {
    const user = await findUser(paramId);
    if (!user) return { error: 'Utilizador não encontrado' };

    const clerk = await clerkClient();
    const clerkUpdate: any = { firstName: data.name, lastName: data.apelido };
    if (data.password?.trim()) clerkUpdate.password = data.password;
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

    revalidatePath("/lists/operadores");
    return { success: true, message: 'Eliminado com sucesso' };
  } catch (error: any) {
    return { error: error.message };
  }
}

// ==========================================
// VENDAS / EVENTOS
// ==========================================

export async function getEventById(id: number) {
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        client: { select: { frst_name: true, lst_name: true, email: true, phone: true, address: true } },
        user: { select: { id: true, internalId: true, frst_name: true, lst_name: true, role: true } }
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
    return null;
  }
}

export async function createEvent(data: {
  clerkUserId: string;
  clientData: any;
  type: EventType;
  channel: EventChannel;
  status: EventStatus;
  obs?: string;
}) {
  try {
    const user = await prisma.user.findUnique({ where: { userId: data.clerkUserId } });
    if (!user) return { error: 'Utilizador não encontrado' };

    const eventId = `EVT_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

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
          userId: user.id,
          clientId: client.id,
          type: data.type,
          channel: data.channel,
          status: data.status,
          obs: data.obs || null,
        }
      });
    });

    revalidatePath("/lists/vendas");
    return { success: true, message: 'Venda criada com sucesso' };
  } catch (error: any) {
    return { error: error.message };
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
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { clientId: true }
    });

    if (!event) return { error: 'Evento não encontrado' };

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

    revalidatePath("/lists/vendas");
    return { success: true, message: 'Venda atualizada com sucesso' };
  } catch (error: any) {
    console.error("Erro update:", error);
    return { error: error.message || 'Erro ao atualizar venda' };
  }
}

export async function deleteEventAction(eventId: number) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { client: true }
    });

    if (!event) return { error: 'Evento não encontrado' };

    await prisma.$transaction(async (tx) => {
      await tx.event.delete({ where: { id: eventId } });
      await tx.client.delete({ where: { id: event.clientId } });
    });

    revalidatePath("/lists/vendas");
    return { success: true, message: 'Venda eliminada com sucesso' };
  } catch (error: any) {
    return { error: error.message };
  }
}