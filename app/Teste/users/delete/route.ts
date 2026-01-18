import { NextRequest, NextResponse } from 'next/server'
import { deleteUserAction } from '@/lib/actions/user.actions'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    const result = await deleteUserAction(userId)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao eliminar user' }, { status: 500 })
  }
}