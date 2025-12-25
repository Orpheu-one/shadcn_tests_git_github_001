import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define as rotas de dashboard
const isDashboardRoute = createRouteMatcher([
  '/admin(.*)',
  '/supervisor(.*)',
  '/operador(.*)', 
  '/vendedor(.*)',
  '/lists(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth()
  const pathname = req.nextUrl.pathname

  // 1. NÃO AUTENTICADO -> Redireciona para Homepage (sign-in) se tentar acessar dashboard
  if (!userId) {
    if (isDashboardRoute(req)) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }

  // 2. AUTENTICADO
  if (sessionClaims) {
    // ✅ AJUSTE AQUI: Acessando 'metadata.userRole' conforme seu JWT Template
    const role = (sessionClaims.metadata as any)?.userRole as string

    console.log('🔎 [Middleware] Debug Session:', JSON.stringify(sessionClaims.metadata))
    console.log('🔎 [Middleware] User:', userId, 'Role:', role, 'Path:', pathname)

    // ✅ REDIRECT baseado no role (quando acessa a raiz ou /redirect)
    if (pathname === '/' || pathname === '/redirect') {
      if (role === 'super-admin' || role === 'admin') {
        return NextResponse.redirect(new URL('/admin', req.url))
      }
      
      if (role === 'supervisor') {
        return NextResponse.redirect(new URL('/supervisor', req.url))
      }
      
      if (role === 'operador') {
        return NextResponse.redirect(new URL('/operador', req.url))
      }
      
      if (role === 'vendedor') {
        return NextResponse.redirect(new URL('/vendedor', req.url))
      }
      
      // Caso o role venha vazio ou não mapeado
      console.warn(`⚠️ [Middleware] Role desconhecido ou ausente: '${role}'`)
      return NextResponse.next()
    }

    // ✅ Verificação de segurança (opcional): Log se user acessa página de outro role
    const roleRouteMap: Record<string, string> = {
      'admin': '/admin',
      'super-admin': '/admin',
      'supervisor': '/supervisor',
      'operador': '/operador',
      'vendedor': '/vendedor',
    }

    const expectedRoute = roleRouteMap[role]
    
    if (expectedRoute && !pathname.startsWith(expectedRoute) && isDashboardRoute(req)) {
      console.warn(`⚠️ [Middleware] Acesso suspeito: Role '${role}' acessando '${pathname}'`)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Pula arquivos internos do Next.js e arquivos estáticos
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Sempre executa para rotas de API
    '/(api|trpc)(.*)',
  ],
}