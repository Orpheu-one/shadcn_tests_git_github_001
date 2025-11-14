

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
  // O Next.js injeta isto automaticamente quando o componente é usado como uma Page
  searchParams: { [key: string]: string | string[] | undefined };
}
// 1. DEFINIÇÃO DO TIPO: Define o que esperamos da base de dados (User + Events)
type UserWithEvents = Prisma.UserGetPayload<{
    include: { events: true }; 
}>;

// Colunas da Tabela
const columns = [
    {
        header:"Info", accessor:"info",
    },
    {
        header:"Connecta ID", accessor:"userId", className:"",
    },
    {
        header:"Nome (Frst_name)", accessor:"frst_name", className:"hidden md:table-cell",
    },
    {
        header:"Telefone", accessor:"phone", className:"hidden md:table-cell",
    },
    {
        // Nota: O teu código original usa 'role' para esta coluna
        header:"Nível de Acesso (Role)", accessor:"role", className:"hidden lg:table-cell", 
    },
    {
        header:"Ações", accessor:"actions", 
    },
]

// 2. FUNÇÃO DE RENDERIZAÇÃO DA LINHA
// Garante que o item é do tipo esperado pelo Prisma (User + Events)
const renderRow = (item: UserWithEvents)=>(

    <tr key={item.id} className="border-b border-gray-500 even:bg-purple-300 hover:bg-purple-500">
        <td className="flex items-center gap-4 p-4">
            <Image 
                src={item.avatar || "/avatar.png"} 
                alt="Avatar" 
                width={60} 
                height={60} 
                className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
            />
            <div className="flex flex-col">
                <h3 className="font-semibold">{item.userId}</h3>
                <h4 className="text-xs text-gray-500">{item.email}</h4>
            </div>
        </td>
        <td className="table-cell">{item.userId}</td>
        <td className="hidden md:table-cell">{item.frst_name}</td>
        <td className="hidden md:table-cell">{item.phone}</td>
        {/* A coluna "Address" original foi substituída por "role" conforme a tua implementação */}
        <td className="hidden md:table-cell">{item.role}</td> 

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
const OperadoresPage = async ({ searchParams }: SearchProps) => {
  const {page,...queryParams}= searchParams;

  const p = page ? parseInt(page as string, 10) : 1;

    // --- 3. CONSULTA DOS DADOS ---
    // Usamos findMany para buscar *todos* os utilizadores (uma lista)
    // Tipamos o resultado como um array: UserWithEvents[]
    const operadores: UserWithEvents[] = await prisma.user.findMany({
        include: {
            events: true, // Inclui os eventos relacionados (para a tipagem)
        },
        take: ITEMS_PER_PAGE, // Limita a 10 resultados para evitar sobrecarga
        skip: (p - 1) * ITEMS_PER_PAGE, // Paginação simples
        // Ordenação (opcional, mas bom para listas)
        orderBy: {
            frst_name: 'asc'
        },
        
    });

    const count = await prisma.user.count();  

   

    // 4. VERIFICAÇÃO (Exemplo: Se a lista estiver vazia)
    if (operadores.length === 0) {
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
                <h1 className="hidden md:block text-lg font-semibold text-black mt-4" >Lista de Operadores</h1>
            
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch />
                    <div className="flex items-center gap-4 self-end">
                        <button className="rounded-full bg-yellow-600 p-2 hover:bg-yellow-700 transition duration-150">
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
                <Table columns={columns} renderRow={renderRow} data={operadores} />
            </div>
            
            {/* PAGINATION */}
            <div className="mt-4">
                <Pagination page={p} count={count} />
            </div>
        </div>
    )
}

export default OperadoresPage