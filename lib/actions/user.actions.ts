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

// ==========================================
// 🆕 HELPERS DE PERMISSÕES
// ==========================================

function canViewAllEvents(role: string): boolean {
  const adminRoles = ['admin', 'super_admin', 'supervisor'];
  return adminRoles.includes(role.toLowerCase());
}

// ==========================================
// 🆕 GET EVENTS FOR CALENDAR (Server Action)
// ==========================================

export async function getCalendarEvents(clerkUserId?: string, userRole?: string) {
  try {
    const whereClause: any = {};
    
    // 🔒 Filtro por operador (se não for admin/supervisor)
    if (clerkUserId && userRole && !canViewAllEvents(userRole)) {
      const user = await prisma.user.findUnique({ 
        where: { userId: clerkUserId } 
      });
      
      if (user) {
        whereClause.userId = user.id;
        console.log(`🔒 [getCalendarEvents] Operador ${user.frst_name} - Filtrando eventos`);
      }
    } else {
      console.log(`👑 [getCalendarEvents] Admin/Supervisor - Mostrando todos os eventos`);
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        client: true,
        user: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // ✅ Transforma para formato do BigCalendar
    return events.map((event) => {
      // 🔧 Para VENDAS: aparece na hora de criação
      // 🔧 Para CALLBACKS: aparece na hora agendada
      const eventDate = event.type === 'CALLBACK' && event.calledback_at
        ? new Date(event.calledback_at)
        : new Date(event.created_at);

      return {
        id: event.id,
        eventIdString: event.event_id,
        title: event.type === 'SALE' ? '💰 Venda' : '📞 Callback',
        start: eventDate.toISOString(),
        end: new Date(eventDate.getTime() + 60 * 60 * 1000).toISOString(),
        type: event.type,
        status: event.status,
        clientName: `${event.client.frst_name} ${event.client.lst_name || ''}`.trim(),
        operatorName: `${event.user.frst_name} ${event.user.lst_name}`,
        obs: event.obs || '',
        createdAt: event.created_at.toISOString()
      };
    });
  } catch (error) {
    console.error('❌ [getCalendarEvents] Erro:', error);
    return [];
  }
}

// 🆕 GET EVENTS LIST (para páginas /lists/vendas, /lists/callbacks)
export async function getEventsList(filters?: {
  clerkUserId?: string;
  userRole?: string;
  type?: 'SALE' | 'CALLBACK' | 'ALL';
  status?: 'PROJECT' | 'CLOSED' | 'LOST' | 'ALL';
  searchQuery?: string;
}) {
  try {
    const whereClause: any = {};
    
    // 🔒 Filtro por operador
    if (filters?.clerkUserId && filters?.userRole && !canViewAllEvents(filters.userRole)) {
      const user = await prisma.user.findUnique({ 
        where: { userId: filters.clerkUserId } 
      });
      if (user) whereClause.userId = user.id;
    }
    
    // 🔍 Filtro por tipo
    if (filters?.type && filters.type !== 'ALL') {
      whereClause.type = filters.type;
    }
    
    // 🔍 Filtro por status
    if (filters?.status && filters.status !== 'ALL') {
      whereClause.status = filters.status;
    }
    
    // 🔍 Search query (nome do cliente ou event_id)
    if (filters?.searchQuery) {
      whereClause.OR = [
        { event_id: { contains: filters.searchQuery } },
        { client: { frst_name: { contains: filters.searchQuery } } },
        { client: { lst_name: { contains: filters.searchQuery } } },
        { client: { phone: { contains: filters.searchQuery } } }
      ];
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        client: true,
        user: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return events;
  } catch (error) {
    console.error('❌ [getEventsList] Erro:', error);
    return [];
  }
}