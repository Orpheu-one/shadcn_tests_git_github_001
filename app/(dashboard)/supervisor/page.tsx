import BigCalendar from "@/components/BigCalendar"
import EventCalendar from "@/components/EventCalendar"
import ListaVendas from "@/components/ListaVendas"

const superPage = () => {
  return (
   <div className='w-full flex px-4 gap-4 flex-col md:flex-row lg:flex-row'>
      {/*left side*/}
      <div className="w-full flex lg:w-2/3 dark:bg-white rounded-lg p-4 text-black">
      <BigCalendar/>
      </div>

      {/*right side*/}
      <div className="w-full flex lg:w-1/3 dark:bg-gray-900 rounded-r-lg">
        <h2 className="text-lg font-semibold">
          <EventCalendar />
          <div className="mt-4"></div>
          <ListaVendas />
        </h2>
      </div>
      
      </div>
  )
}

export default superPage