import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // ✅ Verifica autenticação
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // ✅ Busca todos os eventos com relações
    const events = await prisma.event.findMany({
      include: {
        client: true,
        user: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // 🔍 Debug log
    console.log(`📊 [API /events] Retornando ${events.length} eventos para user ${userId}`);

    return NextResponse.json(events);
  } catch (error) {
    console.error('❌ [API /events] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar eventos' },
      { status: 500 }
    );
  }
}