"use client"

import { Calendar, dayjsLocalizer, View } from 'react-big-calendar'
import dayjs from 'dayjs'
import { useState } from 'react'
import { calendarEvents } from '@/lib/data'
import FormModal from '@/components/FormModal'

const localizer = dayjsLocalizer(dayjs)

const BigCalendar = () => {
  const [view, setView] = useState<View>('week');
  const [openModal, setOpenModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  const handleViewChange = (newView: View) => {
    setView(newView);
  }

  // 🎯 Quando clica num evento existente
  const handleSelectEvent = (event: any) => {
    console.log('📅 Evento clicado:', event);
    setSelectedEvent(event);
    setSelectedSlot(null);
    setOpenModal(true);
  }

  // 🎯 Quando clica num slot vazio (criar novo)
  const handleSelectSlot = (slotInfo: any) => {
    console.log('🆕 Slot vazio clicado:', slotInfo);
    setSelectedEvent(null);
    setSelectedSlot({
      start: slotInfo.start,
      end: slotInfo.end
    });
    setOpenModal(true);
  }

  // 🎯 Fecha o modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedEvent(null);
    setSelectedSlot(null);
  }

  return (
    <>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%", width: "100%" }}
        view={view}
        onView={handleViewChange}
        views={{ month: false, week: true, day: true, agenda: false }}
        min={new Date(0, 0, 0, 10, 0, 0)} // 10:00
        max={new Date(0, 0, 0, 20, 0, 0)} // 20:00
        
        // ✅ HANDLERS para abrir FormModal
        onSelectEvent={handleSelectEvent}  // Clique em evento existente
        onSelectSlot={handleSelectSlot}    // Clique em slot vazio
        selectable={true}                  // Permite selecionar slots
      />

      {/* ✅ MODAL que abre quando clica no calendário */}
      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] max-h-[90vh] overflow-y-auto">
            
            {/* ✅ Cabeçalho do Modal */}
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

            {/* ✅ FORM MODAL */}
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