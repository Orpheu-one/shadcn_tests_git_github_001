import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const {userId} = await params
    const eventId = parseInt(id, 10)

    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: 'ID do evento inválido' },
        { status: 400 }
      )
    }

    // Fetch Event with related Client and User (Operator)
    const event = await prisma.event.findUnique({
      where: { id: eventId },
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
    })

    if (!event) {
      return NextResponse.json(
        { error: `Evento com ID ${eventId} não encontrado` },
        { status: 404 } 
      )
    }

    // Return structured data
    return NextResponse.json({
      eventId: event.id,
      eventIdString: event.event_id,
      createdAt: event.created_at,
      type: event.type,
      channel: event.channel,
      status: event.status,
      obs: event.obs,
      operator: {
        id: event.user.id,
        userId: event.user.userId,
        frst_name: event.user.frst_name,
        lst_name: event.user.lst_name,
        role: event.user.role,
      },
      client: event.client,
    })

  } catch (error) {
    console.error('Erro na API /api/events/[id]:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}