import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'

export default async function RedirectPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in')
  }
  
  const role = (user.publicMetadata as any)?.role as string
  
  console.log('🔍 Role:', role)
  
  // Simple mapping - matches your actual file structure
  if (role === 'super-admin' || role === 'admin') redirect('/admin')
  if (role === 'supervisor') redirect('/supervisor')
  if (role === 'operador') redirect('/operador')
  if (role === 'vendedor') redirect('/vendedor')
  
  // Fallback
  redirect('/admin')
}