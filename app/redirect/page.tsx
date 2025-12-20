import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'

export default async function RedirectPage() {
  // Use auth() to get user session
  const { userId, sessionClaims } = await auth()
  
  if (!userId) {
    console.log('❌ No userId, redirecting to sign-in')
    redirect('/sign-in')
  }

  // Get role from session claims
  const role = (sessionClaims?.metadata as any)?.userRole as string | undefined
  
  console.log('🔍 User ID:', userId)
  console.log('🔍 Role:', role || 'undefined')
  
  // Route based on role (NO try-catch around redirects!)
  if (role === 'super-admin' || role === 'admin') {
    redirect('/admin')
  }
  if (role === 'supervisor') {
    redirect('/supervisor')
  }
  if (role === 'operador' || role === 'operator') {
    redirect('/operador')
  }
  if (role === 'vendedor' || role === 'd2d') {
    redirect('/vendedor')
  }
  
  // Fallback for unknown roles
  console.warn('⚠️ Unknown role, redirecting to admin')
  redirect('/admin')
}