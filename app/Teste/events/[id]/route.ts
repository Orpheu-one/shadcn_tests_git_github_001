import { NextRequest, NextResponse } from 'next/server'
import { getEventById } from '@/lib/actions/user.actions'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await getEventById(Number(params.id))
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar evento' }, { status: 500 })
  }
}