import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { EventType, EventChannel, EventStatus } from '@prisma/client'

// GET - Fetch event by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const eventId = parseInt(id, 10)

    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: 'ID do evento inválido' },
        { status: 400 }
      )
    }

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

// PUT - Update event by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const { id } = await params
    const eventId = parseInt(id, 10)

    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: 'ID do evento inválido' },
        { status: 400 }
      )
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      include: { client: true }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      name,
      apelido,
      email,
      phone,
      address,
      vendaStatus,
      obs,
    } = body

    // Map switch values to Prisma enums
    const typeMap: Record<string, EventType> = {
      'Venda': EventType.SALE,
      'Callback': EventType.CALLBACK,
    }
    const channelMap: Record<string, EventChannel> = {
      'F2F': EventChannel.F2F,
      'Remoto': EventChannel.REMOTE,
    }
    const statusMap: Record<string, EventStatus> = {
      'Projecto': EventStatus.PROJECT,
      'Fechada': EventStatus.CLOSED,
      'Perdida': EventStatus.LOST,
    }

    const eventType = typeMap[vendaStatus?.tipo] || existingEvent.type
    const eventChannel = channelMap[vendaStatus?.modalidade] || existingEvent.channel
    const eventStatus = statusMap[vendaStatus?.status] || existingEvent.status

    // Update Client and Event in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Client
      const client = await tx.client.update({
        where: { id: existingEvent.clientId },
        data: {
          frst_name: name,
          lst_name: apelido || null,
          phone: phone,
          email: email || null,
          address: address,
        },
      })

      // 2. Update Event
      const event = await tx.event.update({
        where: { id: eventId },
        data: {
          type: eventType,
          channel: eventChannel,
          status: eventStatus,
          obs: obs || null,
          calledback_at: eventType === EventType.CALLBACK ? new Date() : existingEvent.calledback_at,
        },
        include: {
          client: true,
          user: {
            select: {
              id: true,
              frst_name: true,
              lst_name: true,
              role: true,
            }
          }
        }
      })

      return { client, event }
    })

    return NextResponse.json({
      success: true,
      message: 'Evento atualizado com sucesso',
      data: result,
    })

  } catch (error) {
    console.error('❌ Erro ao atualizar evento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}