import ChartRadialVendas from "@/components/chartRadialVendas"
import CustomCalendar from "@/components/CustomCalendar"
import EventCalendar from "@/components/EventCalendar"
import ListaVendas from "@/components/ListaVendas"
import TotalVendas from "@/components/TotalVendas"
import UserCard from "@/components/userCard"
import VendasTeams from "@/components/VendasTeams"


const adminPage = () => {
  return (
    <div className='w-full flex gap-4 flex-col md:flex-row lg:flex-row'>
      {/*left side*/}
      <div className="w-full lg:w-2/3 flex flex-col gap-4 dark:bg-transparent rounded-lg">
        <div className="flex justify-content gap-4 flex-wrap">
          <UserCard type="administrador"/>
          <UserCard type="operador"/>
          <UserCard type="supervisor"/>
          <UserCard type="vendedor"/>
        </div>

          {/*bottom chart*/}
      <div className="flex w-full h-[400px] dark:bg-neutral-400 rounded-lg">
          <TotalVendas/>
       </div>
      
      {/*middle*/}
      <div className="flex gap-4 flex-col lg:flex-row ">

       

        {/*chart radial*/}
          <div className="w-full flex lg:w-1/3 h-[400px] dark:bg-gray-300 p-4 rounded-lg">

            <ChartRadialVendas />

          </div>
        {/*chart 2*/}

          <div className="flex w-full lg:w-2/3 h-[400px] dark:bg-neutral-300 rounded-lg">
            <VendasTeams/>

          </div>

          
      
      </div>
     

      </div>
      {/*right side*/}
      <div className="w-full flex lg:w-1/3 dark:bg-transparent flex-col gap-4 rounded-lg">
        <div className="w-full h-[400px] rounded-lg">
        <CustomCalendar />
        <div className="dark:bg-transparent mt-4">
        <ListaVendas/> 
        </div>
        </div>
        
      </div>
      
      </div>
  )
}

export default adminPage