"use client"

import Pagination from "@/components/Pagination"
import Table from "@/components/Table"
import TableSearch from "@/components/TableSearch"
import { operador_Data, role } from "@/lib/data"
import Image from "next/image"
import Link from "next/link"

type operador ={

id:number;
operadorId:string;
name:string;
phone:string;
address:string;
email:string;
photo:string;


}

const  columns = [

    {
        header:"Info", accessor:"info",
    },

    {
        header:"Connecta ID", accessor:"operadorId", className:"",
    },

    {
        header:"Operador", accessor:"operador", className:"hidden md:table-cell",
    },

     {
        header:"Phone", accessor:"phone", className:"hidden md:table-cell",
    },

    {
        header:"Address", accessor:"address", className:"hidden lg:table-cell",
    },

    {
        header:"Actions", accessor:"actions", 
    },
]

const operadorListPage = () => {

const renderRow = (item:operador)=>(

    <tr key={item.id} className="border-b border-gray-500 even:bg-purple-300 hover:bg-purple-500">
        <td className="flex items-center gap-4 p-4">
            <Image src={item.photo?? "/avatar.png"} alt="" width={60} height={60} className="md:hidden xl:block w-10 h-10 rounded-full object-cover"/>
            <div className="flex flex-col">
            <h3 className="font-semibold">{item.name}</h3>
            <h4 className="text-xs text-gray-500">{item.email}</h4>
            </div>
        </td>
        <td className="table-cell">{item.operadorId}</td>
        <td className="hidden md:table-cell">{item.name}</td>
        <td className="hidden md:table-cell">{item.phone}</td>
        <td className="hidden md:table-cell">{item.address}</td>

        <td className=""> 
            <div className="flex items-center gap-2">
            <Link href={`/lists/operadores/${item.id}`}>
                    <button className="w-7 h-7 px-2 items-center rounded-full bg-yellow-500">
                        <Image src="/view.png" alt="" width={16} height={16} />
                    </button>
            </Link>


            <Link href={`/lists/operadores/${item.id}`}>
                {role === "admin" && (
                    
                    <button className="w-7 h-7 px-2 items-center rounded-full bg-red-500">
                        <Image src="/delete.png" alt="" width={16} height={16}/>
                    </button>

                    )}
            </Link>
            
            </div>

        </td>


    </tr>

)

  return (
    <div className=' flex-1 bg-white p-4 rounded-lg m-4 mt-0'>
      {/* TOP */}
      <div className="flex items-center justify-between ">
        <h1 className="hidden md:block text-lg font-semibold text-black mt-4" >Operadores</h1>
      
      <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
        <TableSearch />
        <div className="flex items-center gap-4 self-end">
          <button className="rounded-full bg-yellow-600 p-2">
            <Image src="/filter.png" alt="" width={15} height={15} className="" />
          </button>
           <button className="rounded-full bg-purple-500 p-2">
            <Image src="/sort.png" alt="" width={15} height={15} className="" />
          </button>
          <button className="rounded-full bg-[#e94772b9] p-2">
            <Image src="/plus.png" alt="" width={15} height={15} className="" />
          </button>
        </div>
        </div>
      </div>
      {/*LIST*/}
      <div className="text-black">
        <Table columns={columns} renderRow={renderRow} data={operador_Data} />
      </div>
        {/* PAGINATION */}

        <div className="">
          <Pagination  />

        </div>
    </div>
  )
}

export default operadorListPage