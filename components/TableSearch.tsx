"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"

const TableSearch = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // ✅ Debounce para não fazer query a cada letra (espera 300ms)
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    
    // ✅ Reset para página 1 quando faz nova pesquisa
    params.set('page', '1')
    
    if (term) {
      params.set('query', term)
    } else {
      params.delete('query')
    }
    
    // ✅ Atualiza URL (isso faz server re-render com novo query)
    router.replace(`${pathname}?${params.toString()}`)
  }, 300) // 300ms de delay = tipo AJAX!

  return (
    <div className="w-full md:w-auto flex items-center px-4 ring-[1px] ring-gray-500 rounded-full">
      <input
        type="text"
        placeholder="🔍 Search..."
        className="bg-transparent text-sm text-gray-400 focus:outline-none py-2 w-full"
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get('query')?.toString()}
      />
    </div>
  )
} 

export default TableSearch