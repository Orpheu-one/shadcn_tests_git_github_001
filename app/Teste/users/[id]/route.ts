import { NextRequest, NextResponse } from 'next/server'
import { getOperatorById } from '@/lib/actions/user.actions'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await getOperatorById(params.id)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar user' }, { status: 500 })
  }
}