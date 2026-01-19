"use client"

import { useState } from "react";
import BigCalendar from "@/components/BigCalendar"
import ListaVendas from "@/components/ListaVendas"
import CustomCalendar from "@/components/CustomCalendar";

// ✅ Tipo para os eventos do calendário
interface CalendarEvent {
  id: number;
  eventIdString: string;
  title: string;
  start: string; // ✅ String ISO 8601
  end: string;
  type: 'SALE' | 'CALLBACK';
  status: string;
  clientName: string;
  operatorName: string;
  obs: string;
  createdAt: string;
}

interface OperadorDashboardProps {
  initialEvents: CalendarEvent[];
}

const OperadorDashboard = ({ initialEvents }: OperadorDashboardProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // ✅ Converte strings ISO para Date objects
  const formattedEvents = initialEvents.map(event => ({
    ...event,
    start: new Date(event.start),
    end: new Date(event.end),
    createdAt: new Date(event.createdAt)
  }));

  return (
    <div className='w-full h-screen flex px-4 gap-4 flex-col md:flex-row lg:flex-row'>
      {/* Left side - BigCalendar */}
      <div className="w-full flex lg:w-2/3 dark:bg-white rounded-lg p-4 text-black">
        <BigCalendar 
          selectedDate={selectedDate}
          initialEvents={formattedEvents}
        />
      </div>

      {/* Right side - CustomCalendar + ListaVendas */}
      <div className="w-full flex-wrap gap-4 lg:w-1/3 dark:bg-transparent rounded-r-lg">
        <h2 className="text-lg font-semibold">
          <CustomCalendar 
            showModeToggle={false}
            showPresets={false}
            showEvents={false}
            defaultMode="single"
            onDateSelect={setSelectedDate} 
          />
          <div className="mt-4"></div>
          <ListaVendas />
        </h2>
      </div>
    </div>
  )
}

export default OperadorDashboard