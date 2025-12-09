import FormModal from "@/components/FormModal"
import Pagination from "@/components/Pagination"
import Table from "@/components/Table"
import TableSearch from "@/components/TableSearch"
// import { role } from "@/lib/data" // Mantido fora para evitar o erro de importação, usando 'currentUserRole'
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

// CORREÇÃO TEMPORÁRIA: Variável para o papel do utilizador atual. 
// Assumimos que o utilizador é um admin para que os botões de edição apareçam.
const currentUserRole: 'admin' | 'supervisor' | 'd2d' | 'operator' = 'admin'; 

// Colunas da Tabela
const columns = [
    {
        header:"Info", accessor:"info",
    },
    {
        header:"Connecta ID", accessor:"userId", className:"",
    },
    {
        header:"Nome (Frst_name)", accessor:"name", className:"hidden md:table-cell",
    },
    {
        header:"Telefone", accessor:"phone", className:"hidden md:table-cell",
    },
    {
        header:"Nível de Acesso (Role)", accessor:"role", className:"hidden lg:table-cell", 
    },
    {
        header:"Ações", accessor:"actions", 
    },
]

// 2. FUNÇÃO DE RENDERIZAÇÃO DA LINHA
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
        <td className="hidden md:table-cell">{item.role}</td> 

        <td className=""> 
            <div className="flex items-center gap-2">
                {/* Botão de Edição - Passamos userRole="SUPERVISOR" */}
                <FormModal table="supervisor" type="edit" userRole={UserRole.SUPERVISOR} /> 
            
                {/* Botão de Eliminar (apenas para Admin) - Passamos userRole="SUPERVISOR" */}
                {currentUserRole === "admin" && (
                    <FormModal table="supervisor" type="delete" id={item.id} userRole={UserRole.SUPERVISOR} />
                )}
            </div>
        </td>
    </tr>
)

// COMPONENTE PRINCIPAL (SERVER COMPONENT)
const SupervisorsPage = async ({ searchParams }: SearchProps) => {
  const {page, q, ...queryParams}= searchParams; 

  const p = page ? parseInt(page as string, 10) : 1;
  const query = (q as string)?.toLowerCase() || ''; 

  // --- CONSTRUÇÃO DO FILTRO (WHERE) ---
  const searchFilter = query.length > 0 ? {
    OR: [
        { frst_name: { contains: query, mode: 'insensitive' as const } },
        { lst_name: { contains: query, mode: 'insensitive' as const } },
        { email: { contains: query, mode: 'insensitive' as const } },
        { phone: { contains: query, mode: 'insensitive' as const } },
    ]
  } : {};

  // O filtro total combina o Role fixo e o filtro de pesquisa dinâmico
  const combinedWhere = {
    role: UserRole.SUPERVISOR, // <-- FILTRO APLICADO PARA SUPERVISOR!
    ...searchFilter,           
  };

    // --- 3. CONSULTA DOS DADOS ---
    const supervisors: UserWithEvents[] = await prisma.user.findMany({
        where: combinedWhere,
        include: {
            events: true, 
        },
        take: ITEMS_PER_PAGE, 
        skip: (p - 1) * ITEMS_PER_PAGE, 
        orderBy: {
            frst_name: 'asc'
        },
    });

    // Conta o número total de utilizadores Supervisor para a paginação
    const count = await prisma.user.count({
        where: combinedWhere, // <-- CONTAGEM USA O MESMO FILTRO!
    });  

   

    // 4. VERIFICAÇÃO (Se a lista estiver vazia)
    if (supervisors.length === 0) {
        return (
            <div className="p-8 text-center bg-gray-100 text-gray-700 rounded-lg m-4 mt-0">
                <h2 className="text-xl font-bold">
                    {query.length > 0 ? `Nenhum Supervisor encontrado para "${query}"` : "Nenhum Supervisor Encontrado"}
                </h2>
                <p>Cria o primeiro Supervisor para começar!</p>
                {currentUserRole === "admin" && (
                    <div className="mt-4 inline-block">
                        {/* Botão de Criação - Passamos userRole="SUPERVISOR" */}
                        <FormModal table="supervisor" type="create" userRole={UserRole.SUPERVISOR} />
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
                <h1 className="hidden md:block text-lg font-semibold text-black mt-4" >Lista de Supervisores</h1>
            
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch placeholder="Pesquisar Supervisores..." /> 
                    <div className="flex items-center gap-4 self-end">
                        <button className="rounded-full items-center justify-content bg-yellow-600 p-2 hover:bg-yellow-700 transition duration-150">
                            <Image src="/filter.png" alt="Filtro" width={15} height={15} className="" />
                        </button>
                        <button className="rounded-full items-center justify-content bg-purple-500 p-2 hover:bg-purple-600 transition duration-150">
                            <Image src="/sort.png" alt="Ordenar" width={15} height={15} className="" />
                        </button>
                        {currentUserRole === "admin" && (
                            // Botão de Criação - Passamos userRole="SUPERVISOR"
                            <FormModal table="supervisor" type="create" userRole={UserRole.SUPERVISOR} />
                        )}
                    </div>
                </div>
            </div>
            
            {/* LISTA */}
            <div className="text-black overflow-x-auto">
                <Table columns={columns} renderRow={renderRow} data={supervisors} />
            </div>
            
            {/* PAGINATION */}
            <div className="mt-4">
                <Pagination page={p} count={count} />
            </div>
        </div>
    )
}

export default SupervisorsPage;