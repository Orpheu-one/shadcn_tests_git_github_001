import { PrismaClient } from "@prisma/client"

// A lógica global garante que, mesmo com o Hot Reloading do Next.js
// no modo de desenvolvimento, só haja UMA instância do Prisma Client.

// Cria um tipo global para evitar erros de tipagem
const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Inicializa a instância. Se já existir em 'globalForPrisma', usa-a. Se não, cria uma nova.
const prisma = globalForPrisma.prisma || new PrismaClient({
    // Opcional: Permite ver as queries SQL no console
    log: ['query', 'info', 'warn', 'error'], 
})

// Em desenvolvimento, guarda a instância no objeto global para reutilização
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}

// Exportamos a única instância para ser usada em toda a aplicação (ex: "@/lib/prisma")
export default prisma