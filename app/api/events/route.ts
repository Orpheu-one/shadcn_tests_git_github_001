import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { EventType, EventChannel, EventStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Get database user from Clerk ID
    const dbUser = await prisma.user.findUnique({
      where: { userId: clerkId },
      select: { id: true, role: true }
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Utilizador não encontrado na base de dados' },
        { status: 404 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      // Client data
      name,
      apelido,
      email,
      phone,
      address,
      // Event data
      vendaStatus, // { tipo, modalidade, status }
      obs,
    } = body

    // Validate required fields
    if (!name || !apelido || !phone || !address) {
      return NextResponse.json(
        { error: 'Campos obrigatórios em falta' },
        { status: 400 }
      )
    }

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

    const eventType = typeMap[vendaStatus?.tipo] || EventType.SALE
    const eventChannel = channelMap[vendaStatus?.modalidade] || EventChannel.REMOTE
    const eventStatus = statusMap[vendaStatus?.status] || EventStatus.PROJECT

    // Create Client and Event in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Client
      const client = await tx.client.create({
        data: {
          clientId: `CLI-${Date.now()}`, // Simple unique ID
          frst_name: name,
          lst_name: apelido || null,
          phone: phone,
          email: email || null,
          address: address,
        },
      })

      // 2. Create Event
      const event = await tx.event.create({
        data: {
          event_id: `EVT-${Date.now()}`, // Simple unique ID
          userId: dbUser.id, // Database user ID (integer)
          clientId: client.id,
          type: eventType,
          channel: eventChannel,
          status: eventStatus,
          obs: obs || null,
          // Set calledback_at if it's a callback
          calledback_at: eventType === EventType.CALLBACK ? new Date() : null,
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
      message: 'Evento criado com sucesso',
      data: result,
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Erro ao criar evento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}