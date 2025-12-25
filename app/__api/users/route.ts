import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  console.log('🚀 [API] POST /api/users iniciado');
  console.log('🔍 [API] Request URL:', request.url);
  console.log('🔍 [API] Request method:', request.method);
  
  try {
    // 1. Check authentication
    console.log('1️⃣ Verificando autenticação...');
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      console.error('❌ Usuário não autenticado');
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    console.log('✅ Usuário autenticado:', clerkId);

    // 2. Get clerk client
    console.log('2️⃣ Obtendo Clerk client...');
    const clerk = await clerkClient()
    console.log('✅ Clerk client obtido');

    // 3. Verify admin role
    console.log('3️⃣ Verificando role do usuário atual...');
    const currentUser = await clerk.users.getUser(clerkId)
    const userRole = (currentUser.publicMetadata as any)?.role
    
    console.log('📋 Role do usuário:', userRole);
    
    if (userRole !== 'admin' && userRole !== 'super-admin') {
      console.error('❌ Sem permissões. Role:', userRole);
      return NextResponse.json(
        { error: `Sem permissões (role atual: ${userRole})` },
        { status: 403 }
      )
    }
    console.log('✅ Permissões verificadas');

    // 4. Parse request body
    console.log('4️⃣ Parseando request body...');
    let body;
    try {
      body = await request.json()
      console.log('📦 Body recebido:', { 
        email: body.email, 
        name: body.name, 
        role: body.role,
        hasPassword: !!body.password 
      });
    } catch (parseError) {
      console.error('❌ Erro ao parsear JSON:', parseError);
      return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
    }
    
    const { email, name, apelido, phone, password, role } = body

    if (!email || !name || !role || !password) {
      console.error('❌ Campos obrigatórios em falta:', { 
        email: !!email, 
        name: !!name, 
        role: !!role, 
        password: !!password 
      });
      return NextResponse.json({ 
        error: 'Campos obrigatórios em falta',
        missing: {
          email: !email,
          name: !name,
          role: !role,
          password: !password
        }
      }, { status: 400 })
    }
    console.log('✅ Validação dos campos OK');

    // 5. Generate username
    console.log('5️⃣ Gerando username...');
    const username = `${name.toLowerCase().replace(/\s+/g, '')}${Math.random().toString(36).slice(-4)}`
    console.log('✅ Username gerado:', username);

    // 6. Create in Clerk
    console.log('6️⃣ Criando usuário no Clerk...');
    let newClerkUser;
    try {
      newClerkUser = await clerk.users.createUser({
        username: username,
        emailAddresses: [{ emailAddress: email }],
        firstName: name,
        lastName: apelido || '',
        password: password,
        publicMetadata: {
          role: role.toLowerCase(),
        },
      })
      
      console.log('✅ Clerk user criado:', {
        id: newClerkUser.id,
        username: username,
        email: email
      });

    } catch (clerkError: any) {
      console.error('❌ CLERK ERROR:', {
        errors: clerkError.errors,
        status: clerkError.status,
        message: clerkError.message,
        clerkTraceId: clerkError.clerkTraceId
      });
      
      const errorMsg = clerkError.errors?.[0]?.longMessage 
        || clerkError.errors?.[0]?.message 
        || clerkError.message 
        || 'Erro no Clerk'
      
      return NextResponse.json({ 
        error: `Clerk: ${errorMsg}`,
        details: clerkError.errors?.[0]
      }, { status: 422 })
    }

    // 7. Create in Prisma
    console.log('7️⃣ Criando usuário no banco de dados...');
    try {
      const dbUser = await prisma.user.create({
        data: {
          userId: newClerkUser.id,
          id:
          email: email,
          pwd: 'clerk_managed',
          frst_name: name,
          lst_name: apelido || '',
          phone: phone || null,
          role: role as UserRole,
          is_active: true,
        },
      })

      console.log('✅ Database user criado:', {
        id: dbUser.id,
        userId: dbUser.userId,
        email: dbUser.email
      });

      // 8. Send invitation (optional)
      console.log('8️⃣ Enviando convite...');
      try {
        await clerk.invitations.createInvitation({
          emailAddress: email,
          redirectUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '/redirect',
          publicMetadata: {
            role: role.toLowerCase(),
          },
        })
        console.log('✅ Convite enviado para:', email);
      } catch (inviteError) {
        console.warn('⚠️ Falha ao enviar convite (não crítico)');
      }

      console.log('🎉 Processo completo! Retornando sucesso...');
      
      return NextResponse.json({
        success: true,
        message: `Utilizador criado! Username: ${username}`,
        data: {
          clerkId: newClerkUser.id,
          dbId: dbUser.id,
          username: username,
        }
      }, { status: 201 })

    } catch (prismaError: any) {
      console.error('❌ PRISMA ERROR:', {
        code: prismaError.code,
        message: prismaError.message,
        meta: prismaError.meta
      });

      // Se falhou no Prisma, tenta apagar do Clerk
      console.log('🔄 Tentando reverter criação no Clerk...');
      try {
        await clerk.users.deleteUser(newClerkUser.id);
        console.log('✅ User removido do Clerk');
      } catch (deleteError) {
        console.error('❌ Falha ao reverter Clerk:', deleteError);
      }

      // Handle Prisma unique constraint
      if (prismaError.code === 'P2002') {
        return NextResponse.json({ 
          error: 'Email já existe no banco de dados' 
        }, { status: 409 })
      }

      return NextResponse.json({ 
        error: `Erro no banco: ${prismaError.message}` 
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('🔥 [API] Erro crítico não tratado:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack?.substring(0, 500)
    });
    
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}