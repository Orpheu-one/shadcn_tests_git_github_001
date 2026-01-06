import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define as rotas que requerem autenticação (Dashboard e Listas)
const isDashboardRoute = createRouteMatcher([
  '/admin(.*)',
  '/supervisor(.*)',
  '/operador(.*)', 
  '/vendedor(.*)',
  '/lists(.*)',
])

// Define as rotas sensíveis (Apenas Admin/Super-Admin)
const isAdminOnlyRoute = createRouteMatcher([
  '/lists/administradores(.*)', // ✅ ADICIONADO
  '/lists/supervisores(.*)',
  '/lists/dinamicas(.*)',
])

// Rotas que Vendedor NÃO pode acessar
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

  // 1. NÃO AUTENTICADO -> Redireciona para Login
  if (!userId) {
    if (isDashboardRoute(req)) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }

  // 2. AUTENTICADO
  if (sessionClaims) {
    const role = (sessionClaims.metadata as any)?.userRole as string

    // --- REGRA SUPREMA: ADMIN E SUPER-ADMIN ---
    const isAdmin = role === 'admin' || role === 'super-admin';

    // 3. REDIRECT INICIAL (Apenas na raiz ou /redirect)
    if (pathname === '/' || pathname === '/redirect') {
      if (isAdmin) return NextResponse.redirect(new URL('/admin', req.url))
      if (role === 'supervisor') return NextResponse.redirect(new URL('/supervisor', req.url))
      if (role === 'operador') return NextResponse.redirect(new URL('/operador', req.url))
      if (role === 'vendedor') return NextResponse.redirect(new URL('/vendedor', req.url))
      return NextResponse.next()
    }

    // ✅ ADMIN/SUPER-ADMIN: Acesso total, libera imediatamente
    if (isAdmin) {
      return NextResponse.next()
    }

    // -----------------------------------------------------------------
    // DAQUI PARA BAIXO: RESTRIÇÕES PARA NON-ADMINS
    // -----------------------------------------------------------------

    // Proteção: Rotas exclusivas de Admin
    if (isAdminOnlyRoute(req)) {
      console.warn(`⛔ [Middleware] Acesso negado: ${role} tentou acessar ${pathname}`)
      const homeUrl = role === 'supervisor' ? '/supervisor' :
                      role === 'operador' ? '/operador' :
                      role === 'vendedor' ? '/vendedor' : '/';
      return NextResponse.redirect(new URL(homeUrl, req.url))
    }

    // Proteção: Vendedor não pode acessar certas rotas
    if (role === 'vendedor' && isNotForVendedor(req)) {
      console.warn(`⛔ [Middleware] Vendedor bloqueado em: ${pathname}`)
      return NextResponse.redirect(new URL('/vendedor', req.url))
    }

    // ✅ Log de monitorização (opcional - sem bloquear)
    console.log(`🔎 [Middleware] User: ${userId} Role: ${role} Path: ${pathname}`)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}