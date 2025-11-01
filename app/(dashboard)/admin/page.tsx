import ChartRadialVendas from "@/components/chartRadialVendas"
import EventCalendar from "@/components/EventCalendar"
import ListaVendas from "@/components/ListaVendas"
import TotalVendas from "@/components/TotalVendas"
import UserCard from "@/components/userCard"
import VendasTeams from "@/components/VendasTeams"


const adminPage = () => {
  return (
    <div className='w-full flex gap-4 flex-col md:flex-row lg:flex-row'>
      {/*left side*/}
      <div className="w-full lg:w-2/3 flex flex-col gap-8 dark:bg-gray-950">
        <div className="flex justify-content gap-4 flex-wrap">
          <UserCard type="administrador"/>
          <UserCard type="operador"/>
          <UserCard type="supervisor"/>
          <UserCard type="vendedor"/>
        </div>
      
      {/*middle*/}
      <div className="flex gap-4 flex-col lg:flex-row ">

        {/*chart radial*/}
          <div className="w-full flex lg:w-1/3 h-[400px] dark:bg-white p-4 rounded-lg">

            <ChartRadialVendas />

          </div>
        {/*chart 2*/}

          <div className="flex w-full lg:w-2/3 h-[400px] dark:bg-white rounded-lg">
            <VendasTeams/>

          </div>

          
      {/*bottom chart*/}
      </div>
      <div className="flex w-full h-[400px] dark:bg-white rounded-lg">
          <TotalVendas/>
       </div>

      </div>
      {/*right side*/}
      <div className="w-full flex lg:w-1/3 dark:bg-gray-950 flex-col gap-4 rounded-lg">
        <div className="w-full h-[400px] rounded-lg">
        <EventCalendar />
        <div className="mt-4">
        <ListaVendas/> 
        </div>
        </div>
        
      </div>
      
      </div>
  )
}

export default adminPage