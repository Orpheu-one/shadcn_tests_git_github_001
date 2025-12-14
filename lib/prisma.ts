// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

// Verificação de segurança
if (!process.env.DATABASE_URL) {
  throw new Error(
    '❌ DATABASE_URL não está definida!\n' +
    'Verifique se o ficheiro .env existe na raiz do projeto.'
  )
}

// Log de debug (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  const dbUrl = process.env.DATABASE_URL
  console.log('✅ Prisma conectado:', dbUrl.replace(/:[^:@]+@/, ':****@'))
}

// Declaração global para evitar múltiplas instâncias
declare global {
  var prisma: PrismaClient | undefined
}

// Singleton pattern
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['error', 'warn'] 
      : ['error'],
  })
}

// Em desenvolvimento, usa a instância global
const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export default prisma