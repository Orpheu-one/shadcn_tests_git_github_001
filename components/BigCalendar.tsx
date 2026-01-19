"use client"

import { Calendar, dayjsLocalizer, View } from 'react-big-calendar'
import dayjs from 'dayjs'
import { useState, useEffect } from 'react'
import FormModal from '@/components/FormModal'
import { Button } from "@/components/ui/button"

const localizer = dayjsLocalizer(dayjs)

interface CalendarEvent {
  id: number;
  eventIdString: string;
  title: string;
  start: Date;
  end: Date;
  type: 'SALE' | 'CALLBACK';
  status: string;
  clientName: string;
  operatorName: string;
  obs: string;
  createdAt: Date;
}

interface BigCalendarProps {
  selectedDate?: Date;
  initialEvents?: CalendarEvent[];
}

const BigCalendar = ({ selectedDate, initialEvents = [] }: BigCalendarProps) => {
  const [view, setView] = useState<View>('week');
  const [currentDate, setCurrentDate] = useState<Date>(selectedDate || new Date());
  const [openModal, setOpenModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Simula loading inicial (só visual)
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Atualiza eventos quando initialEvents mudar
  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  // ✅ Atualiza currentDate quando selectedDate muda
  useEffect(() => {
    if (selectedDate) {
      setCurrentDate(selectedDate);
      setView('day');
    }
  }, [selectedDate]);

  const handleViewChange = (newView: View) => {
    setView(newView);
  }

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  }

  const handleSelectEvent = (event: any) => {
    console.log('📅 Evento clicado:', event);
    setSelectedEvent(event);
    setSelectedSlot(null);
    setOpenModal(true);
  }

  const handleSelectSlot = (slotInfo: any) => {
    console.log('🆕 Slot vazio clicado:', slotInfo);
    setSelectedEvent(null);
    setSelectedSlot({
      start: slotInfo.start,
      end: slotInfo.end
    });
    setOpenModal(true);
  }

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedEvent(null);
    setSelectedSlot(null);
  }

  const toggleView = () => {
    setView(prev => prev === 'week' ? 'day' : 'week')
  }

  // 🎨 Cores dos eventos
  const eventStyleGetter = (event: CalendarEvent) => {
    const backgroundColor = event.type === 'SALE' 
      ? '#fde047' // yellow-300 (vendas)
      : '#d8b4fe'; // purple-300 (callbacks)

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: '#000',
        border: 'none',
        display: 'block',
        fontSize: '11px',
        padding: '4px 6px',
      }
    };
  };

  // ✅ Componente de evento customizado (ID + Nome + Obs)
  const CustomEvent = ({ event }: { event: CalendarEvent }) => {
    return (
      <div className="flex flex-col h-full overflow-hidden p-1">
        {/* 📌 Event ID - Tamanho MD */}
        <div className="font-black text-sm truncate uppercase tracking-wide opacity-80">
          {event.eventIdString}
        </div>
        
        {/* 👤 Nome do Cliente - Tamanho SM */}
        <div className="font-bold text-xs truncate mt-1">
          {event.clientName}
        </div>
        
        {/* 📝 Observações - Tamanho SM */}
        {event.obs && (
          <div className="text-xs opacity-70 mt-1 line-clamp-2 leading-tight">
            {event.obs}
          </div>
        )}
      </div>
    );
  };

  const CustomToolbar = (toolbar: any) => {
    return (
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="w-[180px]"></div>
        <div className="flex-1 text-center">
          <span className="text-lg font-bold text-gray-700">
            {toolbar.label}
          </span>
        </div>
        <div className="w-[180px] flex justify-end">
          <div className="flex items-center gap-2 p-1 bg-gray-400/40 rounded-lg">
            <Button
              onClick={toggleView}
              variant="ghost"
              className={`px-4 py-2 font-bold text-xs uppercase transition-all hover:text-black ${
                view === 'day' ? 'bg-white text-black shadow-sm' : 'text-slate-700 hover:bg-gray-200'
              }`}
            >
              Dia
            </Button>
            <Button
              onClick={toggleView}
              variant="ghost"
              className={`px-4 py-2 font-bold text-xs uppercase transition-all hover:text-black ${
                view === 'week' ? 'bg-white text-black shadow-sm' : 'text-slate-700 hover:bg-gray-200'
              }`}
            >
              Semana
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ✅ Loader customizado (estilo CustomCalendar)
  if (isLoading) {
    return (
      <div className="w-full h-full bg-gray-300 rounded-xl animate-pulse flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm font-semibold text-slate-700">A carregar calendário...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%", width: "100%" }}
        view={view}
        date={currentDate}
        onView={handleViewChange}
        onNavigate={handleNavigate}
        views={{ month: false, week: true, day: true, agenda: false }}
        min={new Date(0, 0, 0, 10, 0, 0)}
        max={new Date(0, 0, 0, 20, 0, 0)}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable={true}
        components={{
          toolbar: CustomToolbar,
          event: CustomEvent,
        }}
        eventPropGetter={eventStyleGetter}
      />

      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedEvent ? 'Detalhes da Venda' : 'Nova Venda'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <FormModal 
              table="vendas" 
              type={selectedEvent ? "edit" : "create"}
              id={selectedEvent?.id}
              data={{
                scheduledStart: selectedSlot?.start,
                scheduledEnd: selectedSlot?.end,
                ...selectedEvent
              }}
              forcedOpen={true}
              onClose={handleCloseModal}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default BigCalendar