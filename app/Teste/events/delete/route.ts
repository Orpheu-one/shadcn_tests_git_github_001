import { NextRequest, NextResponse } from 'next/server'
import { deleteEventAction } from '@/lib/actions/user.actions'

export async function POST(request: NextRequest) {
  try {
    const { eventId } = await request.json()
    const result = await deleteEventAction(Number(eventId))
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao eliminar evento' }, { status: 500 })
  }
}