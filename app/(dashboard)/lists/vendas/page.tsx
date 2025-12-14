import FormModal from "@/components/FormModal"
import Pagination from "@/components/Pagination"
import Table from "@/components/Table"
import TableSearch from "@/components/TableSearch"
import { role } from "@/lib/data"
import prisma from "@/lib/prisma" // ✅ Importa o nosso cliente customizado 
import { ITEMS_PER_PAGE } from "@/lib/settings"
import { Prisma } from "@prisma/client"
import Image from "next/image" 

interface SearchProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// --- TIPAGEM CORRIGIDA ---
type EventWithRelations = Prisma.EventGetPayload<{
    include: { 
        user: true;   // O Utilizador que realizou o Evento
        client: true; // O Cliente associado ao Evento
        // ❌ REMOVIDO: event: true (não existe esta relação no schema)
    };
}>;

// Colunas da Tabela
const columns = [
    {
        header: "Info", 
        accessor: "info",
    },
    {
        header: "Venda", 
        accessor: "eventId", 
        className: "",
    },
    {
        header: "Nome", 
        accessor: "name", 
        className: "hidden md:table-cell",
    },
    {
        header: "Telefone", 
        accessor: "phone", 
        className: "hidden md:table-cell",
    },
    {
        header: "Morada", 
        accessor: "address", 
        className: "hidden lg:table-cell", 
    },
    {
        header: "Ações", 
        accessor: "actions", 
    },
]

// FUNÇÃO DE RENDERIZAÇÃO DA LINHA (CORRIGIDA)
const renderRow = (item: EventWithRelations) => (
    <tr 
        key={item.id} 
        className="border-b border-gray-500 even:bg-purple-300 hover:bg-purple-500"
    >
        <td className="flex items-center gap-4 p-4">
            <div className="flex flex-col">
                {/* ✅ CORRIGIDO: Usar event_id ao invés de event */}
                <h3 className="font-semibold">{item.event_id}</h3>
                <h4 className="text-xs text-gray-500">{item.client.email || 'N/A'}</h4>
            </div>
        </td>
        <td className="table-cell">{item.userId}</td>
        <td className="hidden md:table-cell">
            {item.client.frst_name} {item.client.lst_name}
        </td>
        <td className="hidden md:table-cell">{item.client.phone}</td>
        <td className="hidden md:table-cell">{item.client.address}</td> 

        <td> 
            <div className="flex items-center gap-2">
                {/* Botão de Edição */}
                <FormModal table="vendas" type="edit" id={item.id} />
            
                {/* Botão de Eliminar (apenas para Admin) */}
                {role === "admin" && (
                    <FormModal table="vendas" type="delete" id={item.id} />
                )}
            </div>
        </td>
    </tr>
)

// COMPONENTE PRINCIPAL (SERVER COMPONENT)
const EventsPage = async ({ searchParams }: SearchProps) => {
    const params = await searchParams;
    const { page, ...queryParams } = params;

    const p = page ? parseInt(page as string, 10) : 1;

    // ✅ QUERY CORRIGIDA - Removido 'event: true'
    const vendas: EventWithRelations[] = await prisma.event.findMany({
        include: {
            user: true,   // Trazer o objeto do operador
            client: true, // Trazer o objeto do cliente
        },
        take: ITEMS_PER_PAGE,
        skip: (p - 1) * ITEMS_PER_PAGE,
        orderBy: {
            created_at: 'desc' // Mais recentes primeiro
        },
    });

    // ✅ CORRIGIDO: Contar eventos, não users
    const count = await prisma.event.count();

    // Verificação se lista está vazia
    if (vendas.length === 0) {
        return (
            <div className="p-8 text-center bg-gray-100 text-gray-700 rounded-lg m-4 mt-0">
                <h2 className="text-xl font-bold">Nenhuma Venda Encontrada</h2>
                <p>Cria a primeira venda para começar!</p>
                {role === "admin" && (
                    <div className="mt-4 inline-block">
                        <FormModal table="vendas" type="create" />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className='flex-1 bg-white p-4 rounded-lg m-4 mt-0'>
            {/* TOP */}
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold text-black mt-4">
                    Lista de Vendas
                </h1>
            
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch />
                    <div className="flex items-center gap-4 self-end">
                        <button className="rounded-full items-center bg-yellow-500 p-2 hover:bg-yellow-700 transition duration-150">
                            <Image src="/filter.png" alt="Filtro" width={15} height={15} />
                        </button>
                        <button className="rounded-full bg-purple-500 p-2 hover:bg-purple-600 transition duration-150">
                            <Image src="/sort.png" alt="Ordenar" width={15} height={15} />
                        </button>
                        {role === "admin" && (
                            <FormModal table="vendas" type="create" />
                        )}
                    </div>
                </div>
            </div>
            
            {/* LISTA */}
            <div className="text-black overflow-x-auto">
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