import FormModal from "@/components/FormModal"
import Pagination from "@/components/Pagination"
import Table from "@/components/Table"
import TableSearch from "@/components/TableSearch"
//import { role } from "@/lib/data"
import prisma from "@/lib/prisma" 
import { ITEMS_PER_PAGE } from "@/lib/settings"
import { Prisma } from "@prisma/client"
import Image from "next/image" 

interface SearchProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// --- 1. TIPAGEM CORRIGIDA ---
// Agora reflete exatamente o teu schema.prisma
type EventWithRelations = Prisma.EventGetPayload<{
    include: { 
        user: true;   // O Operador/Utilizador que fez a venda
        client: true; // O Cliente que comprou
    };
}>;

const columns = [
    {
        header: "ID Venda", 
        accessor: "event_id",
    },
    {
        header: "Cliente", 
        accessor: "client", 
    },
    {
        header: "Operador", 
        accessor: "user", 
        className: "hidden md:table-cell",
    },
    {
        header: "Contacto", 
        accessor: "phone", 
        className: "hidden md:table-cell",
    },
    {
        header: "Status", 
        accessor: "status", 
        className: "hidden lg:table-cell", 
    },
    {
        header: "Ações", 
        accessor: "actions", 
    },
]

// --- 2. RENDERIZAÇÃO DA LINHA CORRIGIDA ---
const renderRow = (item: EventWithRelations) => (
    <tr 
        key={item.id} 
        className="border-b border-gray-500 even:bg-purple-50 hover:bg-purple-100 text-sm"
    >
        <td className="p-4">
            {/* Mostra o ID legível da venda (ex: V-001) */}
            <span className="font-bold">{item.event_id}</span>
        </td>
        <td className="p-4">
            <div className="flex flex-col">
                <span className="font-semibold">{item.client.frst_name} {item.client.lst_name}</span>
                <span className="text-xs text-gray-500">{item.client.email}</span>
            </div>
        </td>
        <td className="hidden md:table-cell p-4">
            {/* Aqui mostramos o nome do OPERADOR que fez a venda */}
            {item.user.frst_name} {item.user.lst_name}
        </td>
        <td className="hidden md:table-cell p-4">{item.client.phone}</td>
        <td className="hidden lg:table-cell p-4">
            <span className={`px-2 py-1 rounded text-xs ${item.status === 'CLOSED' ? 'bg-green-200' : 'bg-yellow-200'}`}>
                {item.status}
            </span>
        </td> 

        <td> 
            <div className="flex items-center gap-2">
                <FormModal table="vendas" type="edit" id={item.id} />
                {role === "admin" && (
                    <FormModal table="vendas" type="delete" id={item.id} />
                )}
            </div>
        </td>
    </tr>
)

const EventsPage = async ({ searchParams }: SearchProps) => {
    const params = await searchParams;
    const { page } = params;
    const p = page ? parseInt(page as string, 10) : 1;

    // --- 3. QUERY CORRIGIDA ---
    // Removemos o 'event: true' que causava erro, pois estamos na tabela Event
    const vendas = await prisma.event.findMany({
        include: {
            user: true,   // Traz os dados do User (Operador)
            client: true, // Traz os dados do Cliente
        },
        take: ITEMS_PER_PAGE,
        skip: (p - 1) * ITEMS_PER_PAGE,
        orderBy: {
            created_at: 'desc'
        },
    });

    const count = await prisma.event.count();

    if (vendas.length === 0) {
        return (
            <div className="p-8 text-center bg-gray-100 text-black rounded-lg m-4 mt-0">
                <h2 className="text-xl font-bold">Nenhuma Venda Encontrada</h2>
                {role === "admin" && (
                    <div className="mt-4">
                        <FormModal table="vendas" type="create" />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className='flex-1 bg-white p-4 rounded-lg m-4 mt-0'>
            <div className="flex items-center justify-between mb-4">
                <h1 className="hidden md:block text-lg font-semibold text-black">
                    Lista de Vendas
                </h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch />
                    <div className="flex items-center gap-4 self-end">
                        <button className="rounded-full bg-yellow-500 p-2 hover:bg-yellow-600">
                            <Image src="/filter.png" alt="" width={15} height={15} />
                        </button>
                        {role === "admin" && <FormModal table="vendas" type="create" />}
                    </div>
                </div>
            </div>
            
            <div className="text-black overflow-x-auto">
                <Table columns={columns} renderRow={renderRow} data={vendas} />
            </div>
            
            <div className="mt-4">
                <Pagination page={p} count={count} />
            </div>
        </div>
    )
}

export default EventsPage