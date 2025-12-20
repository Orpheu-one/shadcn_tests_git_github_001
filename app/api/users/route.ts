import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // 2. Get clerk client
    const clerk = await clerkClient()

    // 3. Verify admin role
    const currentUser = await clerk.users.getUser(clerkId)
    const userRole = (currentUser.publicMetadata as any)?.role
    
    if (userRole !== 'admin' && userRole !== 'super-admin') {
      return NextResponse.json(
        { error: `Sem permissões (role atual: ${userRole})` },
        { status: 403 }
      )
    }

    // 4. Parse request body
    const body = await request.json()
    const { email, name, apelido, phone, password, role } = body // ✅ Get password from form

    if (!email || !name || !role || !password) {
      return NextResponse.json({ error: 'Campos obrigatórios em falta' }, { status: 400 })
    }

    console.log('🚀 Iniciando criação para:', email)

    // 5. Generate username from name (Clerk requirement)
    const username = `${name.toLowerCase().replace(/\s+/g, '')}${Math.random().toString(36).slice(-4)}`

    // 7. Create in Clerk
    let newClerkUser
    try {
      newClerkUser = await clerk.users.createUser({
        username: username,
        emailAddresses: [{ emailAddress: email }],
        firstName: name,
        lastName: apelido,
        password: password, // ✅ Use password from form
        publicMetadata: {
          role: role.toLowerCase(),
        },
      })
      
      console.log('✅ Clerk user created:', newClerkUser.id, 'Username:', username)

    } catch (clerkError: any) {
      console.error('❌ CLERK ERROR:', JSON.stringify(clerkError.errors, null, 2))
      
      const errorMsg = clerkError.errors?.[0]?.longMessage || clerkError.errors?.[0]?.message || 'Clerk error'
      return NextResponse.json({ error: `Clerk: ${errorMsg}` }, { status: 422 })
    }

    // 8. Create in Prisma
    const dbUser = await prisma.user.create({
      data: {
        userId: newClerkUser.id,
        email: email,
        pwd: 'clerk_managed',
        frst_name: name,
        lst_name: apelido,
        phone: phone || null,
        role: role as UserRole,
        is_active: true,
      },
    })

    console.log('✅ Database user created:', dbUser.id)

    // 9. Send invitation (optional)
    try {
      await clerk.invitations.createInvitation({
        emailAddress: email,
        redirectUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '/redirect',
        publicMetadata: {
          role: role.toLowerCase(),
        },
      })
      console.log('📧 Invitation sent to:', email)
    } catch (inviteError) {
      console.warn('⚠️ Invitation send failed (non-critical)')
    }

    return NextResponse.json({
      success: true,
      message: `Utilizador criado! Username: ${username}`,
      data: {
        clerkId: newClerkUser.id,
        dbId: dbUser.id,
        username: username,
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('🔥 Critical error:', error)
    
    // Handle Prisma unique constraint
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email já existe' }, { status: 409 })
    }
    
    return NextResponse.json(
      { error: error.message || 'Erro interno' },
      { status: 500 }
    )
  }
}