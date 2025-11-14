"use client"

import { ITEMS_PER_PAGE } from "@/lib/settings"
import { useRouter } from "next/navigation"
 

const Pagination = ({page,count}: {page: number, count: number}) => {

const router= useRouter();

const newPage=(newPage:number)=>{

  const params=new URLSearchParams(window.location.search);
  params.set("page", newPage.toString());
  router.push(`${window.location.pathname}?${params}`)

}

  return (
    <div className='p-4 flex items-center justify-between text-gray-500'>
        <button className="py-2 px-4 rounded-md bg-slate-300 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={()=>{newPage(page - 1)}}
        >Prev</button>
        <div className="flex items-center justify-between gap-2 text-sm">

            {Array.from({length: Math.ceil(count / ITEMS_PER_PAGE)}, (_, index) => {
              const pageIndex=index+1;
              return (
              // Adicionado 'key' que é obrigatório no React. O código original falhava aqui.
              <button key={pageIndex} className={`p-1 rounded-xs ${page === pageIndex ? " bg-purple-400" : ""}`}
              onClick={()=>{newPage(pageIndex)}}
              >{pageIndex}</button>
              )
            })}

            
        
        </div>
        <button className="py-2 px-2 rounded-md bg-slate-300 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={()=>{newPage(page + 1)}}
        >Next</button>  
        
    </div>
  )
}

export default Pagination