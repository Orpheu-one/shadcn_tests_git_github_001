

import FormModal from "@/components/FormModal"
import Pagination from "@/components/Pagination"
import Table from "@/components/Table"
import TableSearch from "@/components/TableSearch"
import { role } from "@/lib/data"
// O prisma deve ser importado corretamente (o caminho pode variar)
import prisma from "@/lib/prisma" 
import { ITEMS_PER_PAGE } from "@/lib/settings"
import { Prisma, User, UserRole } from "@prisma/client"
import { SearchParams } from "next/dist/server/request/search-params"
import Image from "next/image" 

interface SearchProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

// --- TIPAGEM DOS MODELOS ---

/**
 * Definição do tipo para o modelo base do Operador (User).
 * Inclui os campos de nome necessários para a Tabela de Operadores.
 */
type EventWithRelations = Prisma.EventGetPayload<{
    include: { 
        // 1. O Utilizador (User) que realizou o Evento.
        // Iremos aceder a: item.user.userId
        user: true; 
        
        // 2. O Cliente (Client) associado ao Evento.
        // Iremos aceder a: item.client.name, item.client.address, etc.
        client: true; 
        
        // 3. O Evento Pai/Relacionado (se for uma auto-relação).
        // Iremos aceder a: item.event.id ou item.event.create_at
        event: true;
    };
}>;
// Colunas da Tabela
const columns = [
    {
        header:"Info", accessor:"info",
    },
    {
        header:"Venda", accessor:"eventId", className:"",
    },
    {
        header:"Nome", accessor:"name", className:"hidden md:table-cell",
    },
    {
        header:"telefone", accessor:"phone", className:"hidden md:table-cell",
    },
    {
        // Nota: O teu código original usa 'role' para esta coluna
        header:"Morada", accessor:"address", className:"hidden lg:table-cell", 
    },
    {
        header:"Ações", accessor:"actions", 
    },
]

// 2. FUNÇÃO DE RENDERIZAÇÃO DA LINHA
// Garante que o item é do tipo esperado pelo Prisma (User + Events)
const renderRow = (item: EventWithRelations)=>(

    <tr key={item.id} className="border-b border-gray-500 even:bg-purple-300 hover:bg-purple-500">
        <td className="flex items-center gap-4 p-4">
            
            <div className="flex flex-col">
                <h3 className="font-semibold">{item.event}</h3>
                <h4 className="text-xs text-gray-500">{item.client.email}</h4>
            </div>
        </td>
        <td className="table-cell">{item.userId}</td>
        <td className="hidden md:table-cell">{item.client.lst_name}</td>
        <td className="hidden md:table-cell">{item.client.phone}</td>
        {/* A coluna "Address" original foi substituída por "role" conforme a tua implementação */}
        <td className="hidden md:table-cell">{item.client.address}</td> 

        <td className=""> 
            <div className="flex items-center gap-2">
                {/* Botão de Edição */}
                <FormModal table="operador" type="edit" />
            
                {/* Botão de Eliminar (apenas para Admin) */}
                {role === "admin" && (
                    <FormModal table="operador" type="delete" id={item.id}/>
                )}
            </div>
        </td>
    </tr>
)

// COMPONENTE PRINCIPAL (SERVER COMPONENT)
const EventsPage = async ({ searchParams }: SearchProps) => {
  const {page,...queryParams}= await searchParams;

  const p = page ? parseInt(page as string, 10) : 1;

    // --- 3. CONSULTA DOS DADOS ---
    // Usamos findMany para buscar *todos* os utilizadores (uma lista)
    // Tipamos o resultado como um array: UserWithEvents[]
    const vendas:EventWithRelations[] = await prisma.event.findMany({
        include: {
        user: true,   // Trazer o objeto do operador
        client: true,
        //event:true // Trazer o objeto do cliente
    },
        take: ITEMS_PER_PAGE, // Limita a 10 resultados para evitar sobrecarga
        skip: (p - 1) * ITEMS_PER_PAGE, // Paginação simples
        // Ordenação (opcional, mas bom para listas)
        orderBy: {
            created_at: 'asc'
        },
        
    });

    const count = await prisma.user.count();  



    // 4. VERIFICAÇÃO (Exemplo: Se a lista estiver vazia)
    if (vendas.length === 0) {
        // Podíamos retornar um componente de "Lista Vazia" mais bonito
        return (
            <div className="p-8 text-center bg-gray-100 text-gray-700 rounded-lg m-4 mt-0">
                <h2 className="text-xl font-bold">Nenhum Operador Encontrado</h2>
                <p>Cria o primeiro operador para começar!</p>
                {role === "admin" && (
                    <div className="mt-4 inline-block">
                        <FormModal table="operador" type="create" />
                    </div>
                )}
            </div>
        );
    }
    // --- Fim da Lógica de Consulta ---


    // 5. RENDERIZAÇÃO
    return (
        <div className=' flex-1 bg-white p-4 rounded-lg m-4 mt-0'>
            {/* TOP */}
            <div className="flex items-center justify-between ">
                <h1 className="hidden md:block text-lg font-semibold text-black mt-4" >Lista de Vendas</h1>
            
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch />
                    <div className="flex items-center gap-4 self-end">
                        <button className="rounded-full items-center bg-yellow-500 p-2 hover:bg-yellow-700 transition duration-150">
                            <Image src="/filter.png" alt="Filtro" width={15} height={15} className="" />
                        </button>
                        <button className="rounded-full bg-purple-500 p-2 hover:bg-purple-600 transition duration-150">
                            <Image src="/sort.png" alt="Ordenar" width={15} height={15} className="" />
                        </button>
                        {role === "admin" && (
                            <FormModal table="operador" type="create" />
                        )}
                    </div>
                </div>
            </div>
            
            {/* LISTA */}
            <div className="text-black overflow-x-auto">
                {/* PASSAMOS O ARRAY DE DADOS COMPLETO PARA O COMPONENTE TABLE */}
                <Table columns={columns} renderRow={renderRow} data={vendas} />
            </div>
            
            {/* PAGINATION */}
            <div className="mt-4">
                <Pagination page={p} count={count} />
            </div>
        </div>
    )
}

export default EventsPage