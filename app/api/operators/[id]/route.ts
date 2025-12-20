import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

// GET - Fetch operator by database ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const operatorId = parseInt(id, 10)

    if (isNaN(operatorId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    const operator = await prisma.user.findUnique({
      where: { id: operatorId },
      select: {
        id: true,
        userId: true, // Clerk ID
        frst_name: true,
        lst_name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        is_active: true,
      },
    })

    if (!operator) {
      return NextResponse.json(
        { error: `Operador com ID ${operatorId} não encontrado` },
        { status: 404 }
      )
    }

    return NextResponse.json(operator)

  } catch (error) {
    console.error('Erro na API /api/operators/[id]:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Update operator
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const operatorId = parseInt(id, 10)

    if (isNaN(operatorId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    // Get existing user
    const existingUser = await prisma.user.findUnique({
      where: { id: operatorId },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Utilizador não encontrado' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      name,
      apelido,
      phone,
      email,
    } = body

    // Update in Clerk
    const client = await clerkClient()
    await client.users.updateUser(existingUser.userId, {
      firstName: name,
      lastName: apelido,
    })

    // Update in Prisma (removed address)
    const updatedUser = await prisma.user.update({
      where: { id: operatorId },
      data: {
        frst_name: name,
        lst_name: apelido,
        phone: phone || null,
        email: email,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Utilizador atualizado com sucesso',
      data: updatedUser,
    })

  } catch (error) {
    console.error('❌ Erro ao atualizar utilizador:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}