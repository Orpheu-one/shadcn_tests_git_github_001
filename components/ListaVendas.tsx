

const ListaVendas = () => {
  return (
    <div className='bg-white mt-4 p-4 rounded-lg text-black'>
      
      <div className="flex justify-between items-center">
            <h1 className="text-lg font-bold ">Vendas</h1>
            <span className="text-sm text-gray-600 hover:underline cursor-pointer">See All</span>
        </div>
        <div className="flex flex-col gap-4">
        <div className="flex flex-col bg-purple-300 rounded-md">
            <div className="p-4 flex items-center justify-between">
                <h1 className="font-semibold  text-gray-600 ">Venda 1</h1>
                <span className="text-xs text-gray-600">10:00 AM</span>
            </div>
            <p className="px-4 mb-2 text-sm color-gray-600">Lorem ipsum dolor sit amet consectetur adipisicing elit. Eum maiores cupiditate nesciunt perferendis dolorem accusantium eligendi sequi, sapiente suscipit tempora, impedit quam aperiam, autem alias.</p>
        </div>

        <div className="flex flex-col bg-yellow-500 rounded-md">
            <div className="p-4 flex items-center justify-between">
                <h1 className="font-semibold  text-gray-600 ">Venda 2</h1>
                <span className="text-xs text-gray-600">11:00 AM</span>
            </div>
            <p className="px-4 mb-2 text-sm color-gray-600">Lorem ipsum dolor sit amet consectetur adipisicing elit. Eum maiores cupiditate nesciunt perferendis dolorem accusantium eligendi sequi, sapiente suscipit tempora, impedit quam aperiam, autem alias.</p>
        </div>

        <div className="flex flex-col bg-purple-300 rounded-md">
            <div className="p-4 flex items-center justify-between">
                <h1 className="font-semibold  text-gray-600 ">Venda 3</h1>
                <span className="text-xs text-gray-600">12:00 PM</span>
            </div>
            <p className="px-4 mb-2 text-sm color-gray-600">Lorem ipsum dolor sit amet consectetur adipisicing elit. Eum maiores cupiditate nesciunt perferendis dolorem accusantium eligendi sequi, sapiente suscipit tempora, impedit quam aperiam, autem alias.</p>
        </div>
        </div>
    </div>
  )
}

export default ListaVendas