"use client"

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
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
  onDateSelect?: (date: Date) => void;
}

const EventCalendar = ({ onDateSelect }: EventCalendarProps) => {
  // 🎯 Estados principais
  const [value, onChange] = useState<Value>(null);
  const [currentMode, setCurrentMode] = useState<'single' | 'range'>('single');
  const { setDateRange } = useDateRange();
  
  // 📦 Histórico do último range selecionado
  const [lastCompletedRange, setLastCompletedRange] = useState<[Date, Date] | null>(null);
  
  // 🔄 Flag para detectar se range está completo (pronto para reset)
  const rangeCompleted = useRef(false);

  // 🔄 Toggle entre modos com RESET completo
  const toggleMode = () => {
    const newMode = currentMode === 'single' ? 'range' : 'single';
    setCurrentMode(newMode);
    onChange(null);
    rangeCompleted.current = false;
    
    console.log('🔄 [EVENT_CALENDAR] Modo alterado para:', newMode);
    console.log('🧹 [EVENT_CALENDAR] Seleção resetada');
  };

  // 🎯 Handler INTELIGENTE com auto-reset
  const handleDateChange = (newValue: Value) => {
    console.log('🖱️ [EVENT_CALENDAR] Clique detectado:', {
      modo: currentMode,
      rangeCompletado: rangeCompleted.current,
      valorRecebido: newValue
    });

    // 🚀 MODO SINGLE: Dispara imediatamente
    if (currentMode === 'single' && newValue && !Array.isArray(newValue)) {
      console.log('📅 [EVENT_CALENDAR] Data única selecionada:', newValue.toLocaleDateString('pt-PT'));
      
      onChange(newValue);
      setDateRange([newValue, newValue]);
      
      if (onDateSelect) {
        onDateSelect(newValue);
      }
      return;
    }

    // 🎯 MODO RANGE: Lógica de auto-reset
    if (currentMode === 'range') {
      
      // ✅ CASO 1: Range anterior completo → RESET e inicia novo
      if (rangeCompleted.current) {
        console.log('🔄 [EVENT_CALENDAR] Range anterior completo! Iniciando NOVO range...');
        
        // Guarda range anterior no histórico
        if (Array.isArray(value) && value[0] && value[1]) {
          setLastCompletedRange([value[0], value[1]]);
          console.log('💾 [EVENT_CALENDAR] Range anterior salvo no histórico:', {
            inicio: value[0].toLocaleDateString('pt-PT'),
            fim: value[1].toLocaleDateString('pt-PT')
          });
        }
        
        // Reset completo
        rangeCompleted.current = false;
        
        // Se newValue é array com apenas início, usa ele; senão extrai a data clicada
        if (Array.isArray(newValue) && newValue[0] && !newValue[1]) {
          onChange([newValue[0], null]);
          console.log('📍 [EVENT_CALENDAR] NOVA data inicial:', newValue[0].toLocaleDateString('pt-PT'));
        } else if (!Array.isArray(newValue)) {
          // Clique direto numa data (sem ser range)
          onChange([newValue, null]);
          console.log('📍 [EVENT_CALENDAR] NOVA data inicial:', newValue.toLocaleDateString('pt-PT'));
        }
        
        return;
      }
      
      // ✅ CASO 2: Primeira seleção (início do range)
      if (!value || !Array.isArray(value) || !value[0]) {
        onChange(newValue);
        
        if (Array.isArray(newValue) && newValue[0]) {
          console.log('📍 [EVENT_CALENDAR] Data INICIAL marcada:', newValue[0].toLocaleDateString('pt-PT'));
          console.log('⏳ [EVENT_CALENDAR] Aguardando data FINAL...');
        }
        return;
      }
      
      // ✅ CASO 3: Range sendo completado (tem início, recebe fim)
      if (Array.isArray(newValue)) {
        const [start, end] = newValue;
        
        if (start && end) {
          const diasReais = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          
          console.log('✅ [EVENT_CALENDAR] RANGE COMPLETO:');
          console.log('  ├─ Início:', start.toLocaleDateString('pt-PT'));
          console.log('  ├─ Fim:', end.toLocaleDateString('pt-PT'));
          console.log('  └─ Total dias:', diasReais);
          
          onChange(newValue);
          setDateRange([start, end]);
          
          // 🎯 Marca como completo (próximo clique reseta)
          rangeCompleted.current = true;
          console.log('🔒 [EVENT_CALENDAR] Range marcado como completo - Próximo clique inicia NOVO range');
          
          return;
        }
      }
      
      // Fallback: Atualiza normalmente
      onChange(newValue);
    }
  };

  // 📊 Log de mudanças no Context
  useEffect(() => {
    if (currentMode === 'range' && Array.isArray(value) && value[0] && value[1]) {
      console.log('✅ [EVENT_CALENDAR] Range enviado ao Context');
    }
  }, [value, currentMode]);

  // 🔢 Cálculo CORRETO de dias
  const calcularDias = (start: Date, end: Date): number => {
    const umDiaEmMs = 1000 * 60 * 60 * 24;
    const diferencaMs = end.getTime() - start.getTime();
    return Math.floor(diferencaMs / umDiaEmMs) + 1;
  };

  return (
    <div className='bg-white p-4 rounded-lg text-black'>
      {/* ✅ TOGGLE */}
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

      {/* ✅ Calendário */}
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

      {/* ✅ Box do range selecionado */}
      {currentMode === 'range' && Array.isArray(value) && value[0] && value[1] && (
        <div className="mt-3 p-3 bg-purple-100 border-2 border-purple-500 rounded-lg shadow-sm animate-fadeIn">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-purple-700 font-bold">📊 Período Selecionado</p>
            {rangeCompleted.current && (
              <span className="text-xs text-purple-600 bg-purple-200 px-2 py-0.5 rounded-full">
                ✓ Completo
              </span>
            )}
          </div>
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
            {calcularDias(value[0], value[1])} dias
          </p>
          {rangeCompleted.current && (
            <p className="text-xs text-purple-500 mt-1 text-center italic">
              Clique numa data para nova seleção
            </p>
          )}
        </div>
      )}

      {/* ✅ Helper text para range */}
      {currentMode === 'range' && (!Array.isArray(value) || !value[0] || !value[1]) && (
        <div className="mt-3 p-2 bg-purple-50 border border-purple-300 rounded-lg text-center">
          <p className="text-xs text-purple-700 font-medium">
            {!value || !Array.isArray(value) || !value[0] ? (
              <>👆 Selecione a data de <strong>início</strong></>
            ) : (
              <>✅ Início marcado! Agora selecione a data de <strong>fim</strong></>
            )}
          </p>
        </div>
      )}

      {/* 💾 Histórico do último range (opcional - para debug) */}
      {lastCompletedRange && currentMode === 'range' && (
        <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
          <span className="font-semibold">Último range:</span> {lastCompletedRange[0].toLocaleDateString('pt-PT')} → {lastCompletedRange[1].toLocaleDateString('pt-PT')}
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