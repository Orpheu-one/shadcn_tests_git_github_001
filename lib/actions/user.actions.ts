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
// BUSCA
// ==========================================

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
      created_at: user.created_at,
    };
  } catch (error) {
    console.error("Erro ao buscar operador:", error);
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
  internalId: string;
  phone?: string;
  password?: string;
  role: UserRole;
}) {
  try {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ internalId: data.internalId }, { email: data.email }] }
    });

    if (existingUser) return { error: 'ID Interno ou Email já existe no sistema' };

    const clerk = await clerkClient();
    const newClerkUser = await clerk.users.createUser({
      username: data.internalId,
      emailAddress: [data.email],
      password: data.password || data.internalId + "_secret",
      firstName: data.name,
      lastName: data.apelido,
      publicMetadata: {
        role: data.role.toLowerCase(),
        internalId: data.internalId,
      }
    });

    const dbUser = await prisma.user.create({
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

    revalidatePath("/lists/operadores");
    return { success: true, message: `Utilizador ${dbUser.internalId} criado!` };
  } catch (error: any) {
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
  try {
    const user = await findUser(paramId);
    if (!user) return { error: 'Utilizador não encontrado' };

    const clerk = await clerkClient();
    const clerkUpdate: any = {
      firstName: data.name,
      lastName: data.apelido,
    };
    
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
    return { error: error.message || 'Erro ao atualizar' };
  }
}

// ==========================================
// UTILIZADORES - DELETE
// ==========================================

export async function deleteUserAction(paramId: string | number) {
  try {
    const user = await findUser(paramId);
    if (!user) return { error: 'Utilizador não encontrado' };

    const clerk = await clerkClient();
    await prisma.user.delete({ where: { id: user.id } });
    
    try {
      await clerk.users.deleteUser(user.userId);
    } catch (e) {
      console.warn("Removido apenas da DB, erro no Clerk.");
    }

    revalidatePath("/lists/operadores");
    return { success: true, message: 'Eliminado com sucesso' };
  } catch (error: any) {
    return { error: error.message || 'Erro ao eliminar' };
  }
}

