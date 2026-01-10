import FormModal from "@/components/FormModal"
import Pagination from "@/components/Pagination"
import Table from "@/components/Table"
import TableSearch from "@/components/TableSearch"
import { role } from "@/lib/data"
import prisma from "@/lib/prisma" 
import { ITEMS_PER_PAGE } from "@/lib/settings"
import { Prisma } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"

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
  { header: "ID Callback", accessor: "event_id" },
  { header: "Cliente", accessor: "client" },
  { header: "Operador", accessor: "user", className: "hidden md:table-cell" },
  { header: "Contacto", accessor: "phone", className: "hidden md:table-cell" },
  { header: "Agendado", accessor: "scheduled", className: "hidden lg:table-cell" },
  { header: "Status", accessor: "status", className: "hidden lg:table-cell" },
  { header: "Acções", accessor: "actions" },
]

const renderRow = (item: EventWithRelations) => (
  <tr 
    key={item.id} 
    className="border-b border-gray-500 even:bg-purple-50 hover:bg-purple-100 text-sm"
  >
    <td className="p-4">
      <span className="font-bold text-black">{item.event_id}</span>
    </td>
    <td className="p-4">
      <div className="flex flex-col">
        <span className="font-semibold text-black">{item.client.frst_name} {item.client.lst_name}</span>
        <span className="text-xs text-gray-500">{item.client.email}</span>
      </div>
    </td>
    <td className="hidden md:table-cell p-4 text-black">
      {item.user.frst_name} {item.user.lst_name}
    </td>
    <td className="hidden md:table-cell p-4 text-black">{item.client.phone}</td>
    <td className="hidden lg:table-cell p-4 text-black">
      {item.Scheduled 
        ? new Date(item.Scheduled).toLocaleDateString('pt-PT', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : <span className="text-gray-400">Não agendado</span>
      }
    </td>
    <td className="hidden lg:table-cell p-4">
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        item.status === 'CLOSED' 
          ? 'bg-green-200 text-green-800' 
          : item.status === 'LOST' 
          ? 'bg-red-200 text-red-800' 
          : 'bg-yellow-200 text-yellow-800'
      }`}>
        {item.status === 'PROJECT' ? 'PROJECTO' : 
         item.status === 'CLOSED' ? 'FECHADO' : 
         item.status === 'LOST' ? 'PERDIDO' : item.status}
      </span>
    </td> 
    <td> 
      <div className="flex items-center gap-2">
        {/* ✅ BOTÃO PARA VER DETALHES */}
        <Link 
          href={`/lists/callbacks/${item.id}`}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-sky-400 hover:bg-sky-500 transition"
        >
          <Image src="/view.png" alt="Ver" width={16} height={16} />
        </Link>
        <FormModal table="callbacks" type="edit" id={item.id} />
        {role === "admin" && (
          <FormModal table="callbacks" type="delete" id={item.id} />
        )}
      </div>
    </td>
  </tr>
)

const CallbacksPage = async ({ searchParams }: SearchProps) => {
  const params = await searchParams;
  const { page } = params;
  const p = page ? parseInt(page as string, 10) : 1;

  const callbacks = await prisma.event.findMany({
    include: {
      user: true, 
      client: true, 
    },
    where: {
      type: 'CALLBACK'
    },
    take: ITEMS_PER_PAGE,
    skip: (p - 1) * ITEMS_PER_PAGE,
    orderBy: {
      created_at: 'desc'
    },
  });

  const count = await prisma.event.count({
    where: {
      type: 'CALLBACK'
    }
  });

  if (callbacks.length === 0) {
    return (
      <div className="flex-1 bg-white p-4 rounded-lg m-4 mt-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-black">
            Lista de Callbacks
          </h1>
          {role === "admin" && (
            <FormModal table="callbacks" type="create" />
          )}
        </div>
        <div className="p-8 text-center bg-gray-100 text-black rounded-lg">
          <h2 className="text-xl font-bold">Nenhum Callback Encontrado</h2>
          <p className="text-gray-600 mt-2">Crie o primeiro callback para começar</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex-1 bg-white p-4 rounded-lg m-4 mt-0'>
      <div className="flex items-center justify-between mb-4">
        <h1 className="hidden md:block text-lg font-semibold text-black">
          Lista de Callbacks
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="rounded-full bg-yellow-500 p-2 hover:bg-yellow-600">
              <Image src="/filter.png" alt="" width={15} height={15} />
            </button>
            {role === "admin" && <FormModal table="callbacks" type="create" />}
          </div>
        </div>
      </div>
      <div className="text-black overflow-x-auto">
        <Table columns={columns} renderRow={renderRow} data={callbacks} />
      </div>
      <div className="mt-4">
        <Pagination page={p} count={count} />
      </div>
    </div>
  )
}

export default CallbacksPage