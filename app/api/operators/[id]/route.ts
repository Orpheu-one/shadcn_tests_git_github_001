import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

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

    // Query Prisma
    const operator = await prisma.user.findUnique({
      where: { id: operatorId },
      select: {
        frst_name: true,
        lst_name: true,
        role: true,
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