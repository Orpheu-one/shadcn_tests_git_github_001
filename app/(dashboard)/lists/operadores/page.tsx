import FormModal from "@/components/FormModal"
import Pagination from "@/components/Pagination"
import Table from "@/components/Table"
import TableSearch from "@/components/TableSearch"
import { role } from "@/lib/data"
import prisma from "@/lib/prisma" 
import { ITEMS_PER_PAGE } from "@/lib/settings"
import { Prisma, UserRole } from "@prisma/client"
import Image from "next/image" 

interface SearchProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

type UserWithEvents = Prisma.UserGetPayload<{
  include: { events: true }; 
}>;

const columns = [
  { header: "Info", accessor: "info" },
  { header: "Connecta ID", accessor: "internalId", className: "" },
  { header: "Nome (Frst_name)", accessor: "name", className: "hidden md:table-cell" },
  { header: "Telefone", accessor: "phone", className: "hidden md:table-cell" },
  { header: "Nível de Acesso (Role)", accessor: "role", className: "hidden lg:table-cell" }, 
  { header: "Ações", accessor: "actions" },
];

const OperadoresPage = async ({ searchParams }: SearchProps) => {
  const params = await searchParams;
  const { page, ...queryParams } = params;
  
  const p = page ? parseInt(page as string, 10) : 1;

  const operadores: UserWithEvents[] = await prisma.user.findMany({
    include: {
      events: true,
    },
    take: ITEMS_PER_PAGE,
    skip: (p - 1) * ITEMS_PER_PAGE,
    orderBy: {
      frst_name: 'asc'
    },
  });

  const count = await prisma.user.count();

  // ✅ ÚNICA MUDANÇA: Definir renderRow DENTRO do componente
  const renderRow = (item: UserWithEvents) => (
    <tr 
      key={item.id} 
      className="border-b border-gray-500 even:bg-neutral-100 hover:bg-purple-300"
    >
      <td className="flex items-center gap-4 p-4">
        <Image 
          src={item.avatar || "/avatar.png"} 
          alt="Avatar" 
          width={60} 
          height={60} 
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.frst_name}</h3>
          <h4 className="text-xs text-gray-500">{item.email}</h4>
        </div>
      </td>
      <td className="table-cell">{item.internalId}</td>
      <td className="hidden md:table-cell">{item.frst_name}</td>
      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden md:table-cell">{item.role}</td>

      <td className=""> 
        <div className="flex items-center gap-2">
          {/* ✅ CAST explícito para UserRole */}
          <FormModal 
            table="operador" 
            type="edit" 
            userId={item.userId}
            userRole={item.role as UserRole}
          />
        
          {role === "admin" && (
            <FormModal 
              table="operador" 
              type="delete" 
              id={item.id}
              userRole={item.role as UserRole}
            />
          )}
        </div>
      </td>
    </tr>
  );

  if (operadores.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-100 text-gray-700 rounded-lg m-4 mt-0">
        <h2 className="text-xl font-bold">Nenhum Operador Encontrado</h2>
        <p>Cria o primeiro operador para começar!</p>
        {role === "admin" && (
          <div className="mt-4 inline-block">
            <FormModal table="operador" type="create" userRole={UserRole.ADMIN} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className='flex-1 bg-neutral-200 p-4 rounded-lg m-4 mt-0'>
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold text-black mt-4">
          Lista de Operadores
        </h1>
      
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="rounded-full items-center justify-content bg-yellow-600 p-2 hover:bg-yellow-700 transition duration-150">
              <Image src="/filter.png" alt="Filtro" width={15} height={15} />
            </button>
            <button className="rounded-full items-center justify-content bg-purple-500 p-2 hover:bg-purple-600 transition duration-150">
              <Image src="/sort.png" alt="Ordenar" width={15} height={15} />
            </button>
            {role === "admin" && (
              <FormModal table="operador" type="create" userRole={UserRole.ADMIN} />
            )}
          </div>
        </div>
      </div>
      
      {/* LISTA - USA O MESMO Table COMPONENT */}
      <div className="text-black overflow-x-auto">
        <Table columns={columns} renderRow={renderRow} data={operadores} />
      </div>
      
      {/* PAGINATION */}
      <div className="mt-4">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default OperadoresPage;