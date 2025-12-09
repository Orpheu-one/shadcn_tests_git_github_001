
import { PrismaClient } from '@prisma/client'; 

// Inicializa o Prisma Client
const prisma = new PrismaClient(); 

// Interface para garantir que os parâmetros da rota são tipados corretamente
interface RouteParams {
    params: {
        id: string; // O ID virá da URL (e.g., /api/operators/1)
    }
}

/**
 * Função GET para buscar detalhes de um utilizador (operador) específico.
 * ROTA: /api/operators/:id
 */
export async function GET(request: Request, { params }: RouteParams) {
    // 1. EXTRAIR E VALIDAR O ID DA URL
    const operatorId = parseInt(params.id); 

    if (isNaN(operatorId) || operatorId <= 0) {
        // ID inválido
        return new Response(JSON.stringify({ error: 'ID de operador inválido.' }), { 
            status: 400,
            headers: { 'Content-Type': 'application/json' } 
        });
    }

    try {
        // 2. CHAMADA AO PRISMA (o teu ORM)
        // Usa findUnique para procurar um único registo pelo ID.
        const user = await prisma.user.findUnique({
            where: { id: operatorId },
            // O 'select' é crucial: devolvemos apenas os campos que o frontend precisa
            select: {
                frst_name: true,
                lst_name: true,
                role: true, 
            },
        });

        if (!user) {
            // Não encontrado
            return new Response(JSON.stringify({ error: `Operador com ID ${operatorId} não encontrado.` }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' } 
            });
        }
        
        // 3. DEVOLVER A RESPOSTA JSON
        return new Response(JSON.stringify(user), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        // Lida com erros internos (base de dados, etc.)
        console.error("Erro ao buscar operador no Prisma:", error);
        return new Response(JSON.stringify({ error: 'Erro interno do servidor ao buscar dados.' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' } 
        });
    }
}

// Opcional: Impedir outros métodos HTTP
export async function POST() {
    return new Response(null, { status: 405 }); 
}