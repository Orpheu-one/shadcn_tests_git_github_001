import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

// GET - Buscar operador por userId (Clerk ID)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Check authentication
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // 2. Get userId from params (this is the Clerk ID string)
    const { id: userId } = await params
    
    console.log('🔍 [API] Buscando operador com userId:', userId)

    // 3. Find user by userId (Clerk ID)
    const user = await prisma.user.findUnique({
      where: {
        userId: userId, // ✅ Busca pelo Clerk ID, não pelo database id
      },
    })

    if (!user) {
      console.log('❌ [API] Operador não encontrado')
      return NextResponse.json(
        { error: 'Operador não encontrado' },
        { status: 404 }
      )
    }

    console.log('✅ [API] Operador encontrado:', {
      id: user.id,
      userId: user.userId,
      email: user.email,
      phone: user.phone,
    })

    // 4. Return user data
    return NextResponse.json({
      id: user.id,
      userId: user.userId,
      email: user.email,
      frst_name: user.frst_name,
      lst_name: user.lst_name,
      phone: user.phone,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
    })

  } catch (error: any) {
    console.error('❌ [API] Erro ao buscar operador:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar operador
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Check authentication
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // 2. Get userId from params
    const { id: userId } = await params
    
    // 3. Parse request body
    const body = await request.json()
    const { name, apelido, email, phone } = body

    console.log('✏️ [API] Atualizando operador:', userId, body)

    // 4. Update user by userId (Clerk ID)
    const updatedUser = await prisma.user.update({
      where: {
        userId: userId, // ✅ Atualiza usando Clerk ID
      },
      data: {
        frst_name: name,
        lst_name: apelido,
        email: email,
        phone: phone || null,
      },
    })

    console.log('✅ [API] Operador atualizado com sucesso')

    return NextResponse.json({
      success: true,
      message: 'Operador atualizado com sucesso',
      data: updatedUser,
    })

  } catch (error: any) {
    console.error('❌ [API] Erro ao atualizar operador:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Operador não encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Erro interno' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar operador
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Check authentication
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // 2. Get userId from params
    const { id: userId } = await params
    
    console.log('🗑️ [API] Eliminando operador:', userId)

    // 3. Delete user by userId (Clerk ID)
    await prisma.user.delete({
      where: {
        userId: userId, // ✅ Elimina usando Clerk ID
      },
    })

    console.log('✅ [API] Operador eliminado com sucesso')

    return NextResponse.json({
      success: true,
      message: 'Operador eliminado com sucesso',
    })

  } catch (error: any) {
    console.error('❌ [API] Erro ao eliminar operador:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Operador não encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Erro interno' },
      { status: 500 }
    )
  }
}