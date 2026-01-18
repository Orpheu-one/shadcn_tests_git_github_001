import { currentUser } from '@clerk/nextjs/server'

// ✅ Roles como estão no Clerk (lowercase do Prisma)
export type ClerkRole = 'admin' | 'super_admin' | 'operator' | 'supervisor' | 'd2d'

// ✅ Mapeamento: Clerk role → Rota
export const ROLE_ROUTES: Record<ClerkRole, string> = {
  'super_admin': '/admin',
  'admin': '/admin',
  'supervisor': '/supervisor',
  'operator': '/operador',
  'd2d': '/vendedor',
}

export async function getUserRole(): Promise<ClerkRole | null> {
  const user = await currentUser()
  if (!user) {
    console.log('❌ User not authenticated')
    return null
  }

  const role = (user.publicMetadata as any)?.role as ClerkRole | undefined

  console.log('📋 User ID:', user.id)
  console.log('📋 Email:', user.emailAddresses[0]?.emailAddress)
  console.log('📋 Role from publicMetadata:', role || 'UNDEFINED')

  return role || null
}

export async function getUserHomeRoute(): Promise<string> {
  const user = await currentUser()
  if (!user) {
    console.log('⚠️ Not authenticated → /sign-in')
    return '/sign-in'
  }

  const role = (user.publicMetadata as any)?.role as ClerkRole | undefined

  if (!role) {
    console.log('⚠️ No role defined → /sem-permissao')
    return '/sem-permissao'
  }

  const route = ROLE_ROUTES[role]
  
  if (!route) {
    console.log(`⚠️ Invalid role "${role}" → /sem-permissao`)
    return '/sem-permissao'
  }

  console.log(`✅ Redirecting ${role} → ${route}`)
  return route
}