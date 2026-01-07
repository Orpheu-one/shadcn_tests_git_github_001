import FormModal from "@/components/FormModal"
import Pagination from "@/components/Pagination"
import Table from "@/components/Table"
import TableSearch from "@/components/TableSearch"
import { role } from "@/lib/data"
import prisma from "@/lib/prisma" 
import { ITEMS_PER_PAGE } from "@/lib/settings"
import { Prisma } from "@prisma/client"
import Image from "next/image" 

interface SearchProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

type EventWithRelations = Prisma.EventGetPayload<{
  include: { 
    user: true;
    client: true;
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
    header: "Acções", 
    accessor: "actions", 
  },
]

// Função helper para mapear status DB -> UI
const getStatusDisplay = (status: string) => {
  const statusMap: Record<string, { label: string; bgColor: string; textColor: string }> = {
    'PROJECT': { label: 'Projecto', bgColor: 'bg-yellow-300', textColor: 'text-yellow-900' },
    'CLOSED': { label: 'Fechada', bgColor: 'bg-green-300', textColor: 'text-green-900' },
    'LOST': { label: 'Perdida', bgColor: 'bg-red-300', textColor: 'text-red-900' },
  };
  
  return statusMap[status] || { label: status, bgColor: 'bg-gray-300', textColor: 'text-gray-900' };
};

const renderRow = (item: EventWithRelations) => {
  const statusDisplay = getStatusDisplay(item.status);
  
  return (
    <tr 
      key={item.id} 
      className="border-b border-gray-500 even:bg-purple-50 hover:bg-purple-100 text-sm"
    >
      <td className="p-4">
        <span className="font-bold">{item.event_id}</span>
      </td>
      <td className="p-4">
        <div className="flex flex-col">
          <span className="font-semibold">{item.client.frst_name} {item.client.lst_name}</span>
          <span className="text-xs text-gray-500">{item.client.email}</span>
        </div>
      </td>
      <td className="hidden md:table-cell p-4">
        {item.user.frst_name} {item.user.lst_name}
      </td>
      <td className="hidden md:table-cell p-4">{item.client.phone}</td>
      <td className="hidden lg:table-cell p-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusDisplay.bgColor} ${statusDisplay.textColor}`}>
          {statusDisplay.label}
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
  );
};

const EventsPage = async ({ searchParams }: SearchProps) => {
  const params = await searchParams;
  const { page } = params;
  const p = page ? parseInt(page as string, 10) : 1;

  const vendas = await prisma.event.findMany({
    include: {
      user: true,
      client: true,
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