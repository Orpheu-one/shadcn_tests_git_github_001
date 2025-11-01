const Pagination = () => {
  return (
    <div className='p-4 flex items-center justify-between text-gray-500'>
        <button className="py-2 px-4 rounded-md bg-slate-300 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed">Prev</button>
        <div className="flex items-center justify-between gap-2 text-sm">
            <button className="p-2 rounded-md bg-purple-400 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed">1</button>
            <button className="p-2 rounded-md text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed">2</button>
            <button className="p-2 rounded-md text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed">3</button>
            ...
            <button className="p-2 rounded-md text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed">10</button>
        </div>
        <button className="py-1 px-2 rounded-md bg-slate-300 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed">Next</button>  
        
    </div>
  )
}

export default Pagination