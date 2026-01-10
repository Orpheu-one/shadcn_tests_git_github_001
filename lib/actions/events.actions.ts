// lib/actions/event.actions.ts
'use server'

import { db } from "@/lib/db"; // Ajusta o import do teu prisma client se for diferente

export async function getEventWithDetails(eventId: number) {
  try {
    const event = await db.event.findUnique({
      where: {
        id: eventId,
      },
      include: {
        client: true, // Traz os dados do Cliente
        user: true,   // Traz os dados do User (Vendedor/Operador)
      },
    });

    return event;
  } catch (error) {
    console.error("Erro ao buscar evento:", error);
    return null;
  }
}