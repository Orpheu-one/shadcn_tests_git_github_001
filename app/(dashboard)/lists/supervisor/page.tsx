import Pagination from "@/components/Pagination"
import TableSearch from "@/components/TableSearch"
import Image from "next/image"

const supervisorListPage = () => {
  return (
    <div className=' flex-1 bg-white p-4 rounded-lg m-4 mt-0'>
      {/* TOP */}
      <div className="flex items-center justify-between ">
        <h1 className="hidden md:block text-lg font-semibold text-black mt-4" >TEAM</h1>
      
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
      <div className="">

      </div>
        {/* PAGINATION */}

        <div className="">
          <Pagination />

        </div>
    </div>
  )
}

export default supervisorListPage