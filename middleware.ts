import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isDashboardRoute = createRouteMatcher([
  '/admin(.*)',
  '/supervisor(.*)',
  '/operador(.*)', 
  '/vendedor(.*)',
  '/lists(.*)',
])

const isAdminOnlyRoute = createRouteMatcher([
  '/lists/administradores(.*)',
  '/lists/supervisores(.*)',
  '/lists/dinamicas(.*)',
])

const isNotForVendedor = createRouteMatcher([
  '/lists/callbacks(.*)',
  '/lists/operadores(.*)',
  '/lists/supervisores(.*)',
  '/lists/administradores(.*)',
  '/lists/dinamicas(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth()
  const pathname = req.nextUrl.pathname

  if (!userId) {
    if (isDashboardRoute(req)) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }

  if (sessionClaims) {
    // 🔍 DEBUG: Mostra TODOS os metadatas disponíveis
    console.log('🔍 [DEBUG] sessionClaims completo:', JSON.stringify({
      publicMetadata: sessionClaims.publicMetadata,
      unsafeMetadata: sessionClaims.unsafeMetadata,
      metadata: (sessionClaims as any).metadata,
    }, null, 2))

    // Tenta todas as localizações possíveis
    let role = (sessionClaims.publicMetadata as any)?.role as string | undefined
    
    if (!role) {
      role = (sessionClaims.unsafeMetadata as any)?.role as string | undefined
      if (role) console.log('✅ [DEBUG] Role encontrado em unsafeMetadata:', role)
    } else {
      console.log('✅ [DEBUG] Role encontrado em publicMetadata:', role)
    }

    if (!role) {
      role = (sessionClaims as any)?.metadata?.userRole as string | undefined
      if (role) console.log('✅ [DEBUG] Role encontrado em metadata.userRole:', role)
    }

    if (!role && isDashboardRoute(req)) {
      console.error(`⛔ [Middleware] User ${userId} sem role em NENHUM metadata!`)
      
      if (pathname !== '/sem-acesso') {
        return NextResponse.redirect(new URL('/sem-acesso', req.url))
      }
      
      return NextResponse.next()
    }

    const normalizedRole = role?.toLowerCase()
    const isAdmin = normalizedRole === 'admin' || normalizedRole === 'super_admin'

    if (pathname === '/' || pathname === '/redirect') {
      if (!normalizedRole) {
        console.error(`⛔ [Middleware] Sem role no login`)
        return NextResponse.redirect(new URL('/sem-acesso', req.url))
      }

      console.log(`🔀 [Middleware] Redirecting ${normalizedRole}`)
      
      if (isAdmin) return NextResponse.redirect(new URL('/admin', req.url))
      if (normalizedRole === 'supervisor') return NextResponse.redirect(new URL('/supervisor', req.url))
      if (normalizedRole === 'operator' || normalizedRole === 'operador') {
        return NextResponse.redirect(new URL('/operador', req.url))
      }
      if (normalizedRole === 'd2d' || normalizedRole === 'vendedor') {
        return NextResponse.redirect(new URL('/vendedor', req.url))
      }

      console.error(`⛔ [Middleware] Role não reconhecido: ${role}`)
      return NextResponse.redirect(new URL('/sem-acesso', req.url))
    }

    if (isAdmin) {
      return NextResponse.next()
    }

    const userHomePath = 
      normalizedRole === 'supervisor' ? '/supervisor' :
      (normalizedRole === 'operator' || normalizedRole === 'operador') ? '/operador' :
      (normalizedRole === 'd2d' || normalizedRole === 'vendedor') ? '/vendedor' : null

    if (isAdminOnlyRoute(req)) {
      if (userHomePath && pathname !== userHomePath) {
        return NextResponse.redirect(new URL(userHomePath, req.url))
      }
      return NextResponse.next()
    }

    if ((normalizedRole === 'd2d' || normalizedRole === 'vendedor') && isNotForVendedor(req)) {
      if (pathname !== '/vendedor') {
        return NextResponse.redirect(new URL('/vendedor', req.url))
      }
      return NextResponse.next()
    }

    console.log(`🔎 [Middleware] ${normalizedRole} -> ${pathname}`)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}