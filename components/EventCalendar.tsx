"use client"

import Image from "next/image";
import { useState, useEffect } from "react";
import { Calendar } from "react-calendar";
import { useDateRange } from "@/components/contexts/DateRangeContext";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

{/*TEMP EVENT LIST*/ }
const events = [
  { id: "1", title: "Event 1", time: "12:00-PM 14:00 PM", desc:"this is a description" },
  { id: "2", title: "Event 2", time: "12:00-PM 14:00 PM", desc:"this is a description" },
  { id: "3", title: "Event 3", time: "12:00-PM 14:00 PM", desc:"this is a description" },
]

interface EventCalendarProps {
  onDateSelect?: (date: Date) => void; // ✅ Só dispara em single mode
}

const EventCalendar = ({ onDateSelect }: EventCalendarProps) => {
  // ✅ Estado INTERNO - Componente autossuficiente
  const [value, onChange] = useState<Value>(new Date());
  const [currentMode, setCurrentMode] = useState<'single' | 'range'>('single'); // ✅ Default: single
  const { setDateRange } = useDateRange();

  // ✅ Toggle entre modos - Simples e direto
  const toggleMode = () => {
    const newMode = currentMode === 'single' ? 'range' : 'single';
    setCurrentMode(newMode);
    onChange(new Date()); // Reset selection
    console.log('🔄 Modo alterado para:', newMode);
  };

  // ✅ Handler unificado para ambos os modos
  const handleDateChange = (newValue: Value) => {
    onChange(newValue);
    
    // MODO SINGLE: Callback para BigCalendar
    if (currentMode === 'single' && newValue && !Array.isArray(newValue)) {
      console.log('📅 Data única selecionada:', newValue.toLocaleDateString('pt-PT'));
      if (onDateSelect) {
        onDateSelect(newValue);
      }
    }
    
    // MODO RANGE: Direto para Context
    if (currentMode === 'range' && Array.isArray(newValue)) {
      const [start, end] = newValue;
      if (start && end) {
        console.log('📊 RANGE SELECIONADO:');
        console.log('  ├─ Início:', start.toLocaleDateString('pt-PT'));
        console.log('  ├─ Fim:', end.toLocaleDateString('pt-PT'));
        console.log('  └─ Total dias:', Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
        setDateRange([start, end]);
      }
    }
  };

  // ✅ Log quando range atualiza
  useEffect(() => {
    if (currentMode === 'range' && Array.isArray(value) && value[0] && value[1]) {
      console.log('🔄 Range salvo no Context');
    }
  }, [value, currentMode]);

  return (
    <div className='bg-white p-4 rounded-lg text-black'>
      
      {/* ✅ TOGGLE - SEMPRE VISÍVEL */}
      <div className="mb-4 flex items-center justify-center gap-2 pb-3 border-b-2 border-gray-200">
        <button
          onClick={toggleMode}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm
            transition-all duration-300 transform hover:scale-105
            ${currentMode === 'single' 
              ? 'bg-yellow-400 text-gray-900 shadow-md' 
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }
          `}
        >
          <span className="text-lg">📅</span>
          <span>Dia Único</span>
        </button>

        <div className="w-8 h-1 bg-gray-300 rounded"></div>

        <button
          onClick={toggleMode}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm
            transition-all duration-300 transform hover:scale-105
            ${currentMode === 'range' 
              ? 'bg-purple-500 text-white shadow-md' 
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }
          `}
        >
          <span className="text-lg">📊</span>
          <span>Período</span>
        </button>
      </div>

      {/* ✅ Calendário com highlight condicional */}
      <div className={currentMode === 'range' ? 'calendar-range-mode' : ''}>
        <Calendar 
          onChange={handleDateChange}
          value={value}
          locale="en-EN"
          selectRange={currentMode === 'range'}
          formatShortWeekday={(locale, date) =>
            date
              .toLocaleDateString(locale, { weekday: "short" })
              .replace(".", "")
          } 
        />
      </div>

      {/* ✅ Box visual do range selecionado */}
      {currentMode === 'range' && Array.isArray(value) && value[0] && value[1] && (
        <div className="mt-3 p-3 bg-purple-100 border-2 border-purple-500 rounded-lg shadow-sm animate-fadeIn">
          <p className="text-xs text-purple-700 font-bold mb-1">📊 Período Selecionado</p>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Início</span>
              <span className="text-sm font-semibold text-purple-700">
                {value[0].toLocaleDateString('pt-PT')}
              </span>
            </div>
            <div className="text-purple-500 font-bold text-xl">→</div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Fim</span>
              <span className="text-sm font-semibold text-purple-700">
                {value[1].toLocaleDateString('pt-PT')}
              </span>
            </div>
          </div>
          <p className="text-xs text-purple-600 mt-2 text-center font-semibold">
            {Math.ceil((value[1].getTime() - value[0].getTime()) / (1000 * 60 * 60 * 24)) + 1} dias
          </p>
        </div>
      )}

      {/* ✅ Helper text para range mode */}
      {currentMode === 'range' && (!Array.isArray(value) || !value[0] || !value[1]) && (
        <div className="mt-3 p-2 bg-purple-50 border border-purple-300 rounded-lg text-center">
          <p className="text-xs text-purple-700 font-medium">
            👆 Clique na data de <strong>início</strong>, depois na data de <strong>fim</strong>
          </p>
        </div>
      )}

      {/* ✅ Lista de eventos */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-bold mt-4">Events</h1>
        <Image src="/moreDark.png" alt="more" width={20} height={20} className=""/>
      </div>
      
      <div className="flex flex-col gap-4">
        {events.map((event) => (
          <div key={event.id} className="">
            <div className="p-4 border-2 border-t-4 odd:border-t-purple-500 even:border-t-yellow-600">
              <div className="flex items-center justify-between gap-1">
                <h1 className="font-semibold text-gray-600 ">{event.title}</h1>
                <span className="text-xs text-gray-600">{event.time}</span>
              </div>
              <p className="text-gray-700 text-sm">{event.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EventCalendar