import { currentUser } from '@clerk/nextjs/server'

export type UserRole = 'admin' | 'super-admin' | 'operador' | 'vendedor' | 'supervisor'

// ✅ FIXED: Routes match your actual file structure
export const ROLE_ROUTES: Record<UserRole, string> = {
  'super-admin': '/admin',
  'admin': '/admin',
  'supervisor': '/supervisor',
  'operador': '/operador',
  'vendedor': '/vendedor',
}

export async function getUserRole(): Promise<UserRole | null> {
  const user = await currentUser()
  
  if (!user) {
    console.log('❌ User not authenticated')
    return null
  }
  
  const role = (user.publicMetadata as any)?.role as UserRole | undefined
  
  console.log('🔍 User ID:', user.id)
  console.log('🔍 Email:', user.emailAddresses[0]?.emailAddress)
  console.log('🔍 Role:', role || 'UNDEFINED')
  
  return role || null
}

export async function getUserHomeRoute(): Promise<string> {
  const user = await currentUser()
  
  if (!user) {
    console.log('⚠️ Not authenticated → /sign-in')
    return '/sign-in'
  }

  const role = (user.publicMetadata as any)?.role as UserRole | undefined
  
  if (!role) {
    console.log('⚠️ No role → /admin')
    return '/admin'
  }

  const route = ROLE_ROUTES[role] || '/admin'
  console.log(`✅ Redirecting ${role} → ${route}`)
  
  return route
}