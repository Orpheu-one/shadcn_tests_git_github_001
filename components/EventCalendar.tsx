"use client"

import Image from "next/image";
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useDateRange } from "@/components/contexts/DateRangeContext";
import { DateRange } from "react-day-picker";
import { startOfYear, endOfYear } from "date-fns";
import { pt } from "date-fns/locale";

const events = [
  { id: "1", title: "Event 1", time: "12:00-PM 14:00 PM", desc: "this is a description" },
  { id: "2", title: "Event 2", time: "12:00-PM 14:00 PM", desc: "this is a description" },
  { id: "3", title: "Event 3", time: "12:00-PM 14:00 PM", desc: "this is a description" },
];

const EventCalendar = ({ onDateSelect }: { onDateSelect?: (date: Date) => void }) => {
  const [currentMode, setCurrentMode] = useState<'single' | 'range'>('single');
  const { setDateRange } = useDateRange();
  const [singleDate, setSingleDate] = useState<Date | undefined>(undefined);
  const [rangeDate, setRangeDate] = useState<DateRange | undefined>(undefined);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) {
    // Placeholder cinzento enquanto carrega para evitar layout shift
    return <div className="w-full h-[500px] bg-gray-300 rounded-xl animate-pulse" />;
  }

  const toggleMode = () => {
    setCurrentMode(prev => (prev === 'single' ? 'range' : 'single'));
    setSingleDate(undefined);
    setRangeDate(undefined);
  };

  const handleSingleSelect = (date: Date | undefined) => {
    setSingleDate(date);
    if (date) {
      setDateRange([date, date]);
      if (onDateSelect) onDateSelect(date);
    }
  };

  const handleRangeSelect = (range: DateRange | undefined) => {
    setRangeDate(range);
    if (range?.from && range?.to) {
      setDateRange([range.from, range.to]);
    }
  };

  const applyPreset = (preset: string) => {
    const hoje = new Date(2026, 0, 13);
    let from: Date, to: Date;
    switch (preset) {
      case 'Q1': from = new Date(2026, 0, 1); to = new Date(2026, 2, 31); break;
      case 'Q2': from = new Date(2026, 3, 1); to = new Date(2026, 5, 30); break;
      case 'Q3': from = new Date(2026, 6, 1); to = new Date(2026, 8, 30); break;
      case 'Q4': from = new Date(2026, 9, 1); to = new Date(2026, 11, 31); break;
      case 'S1': from = new Date(2026, 0, 1); to = new Date(2026, 5, 30); break;
      case 'S2': from = new Date(2026, 6, 1); to = new Date(2026, 11, 31); break;
      case 'ANO': from = startOfYear(hoje); to = endOfYear(hoje); break;
      default: return;
    }
    if (currentMode !== 'range') setCurrentMode('range');
    setRangeDate({ from, to });
    setDateRange([from, to]);
  };

  return (
    // CONTAINER PRINCIPAL: Força bg-gray-300 e texto escuro
    <div className="bg-gray-300 p-4 rounded-xl w-full shadow-sm text-slate-900 border-none">
      {/* 1. MODO TOGGLE */}
      <div className="mb-4 flex items-center justify-between gap-2 p-1 bg-gray-400/40 rounded-lg">
        <Button
          onClick={toggleMode}
          variant="ghost"
          className={`flex-1 font-bold text-xs uppercase transition-all hover:text-black ${
            currentMode === 'single' ? 'bg-white text-black shadow-sm' : 'text-slate-700 hover:bg-gray-200'
          }`}
        >
          Dia Único
        </Button>
        <Button
          onClick={toggleMode}
          variant="ghost"
          className={`flex-1 font-bold text-xs uppercase transition-all hover:text-black ${
            currentMode === 'range' ? 'bg-white text-black shadow-sm' : 'text-slate-700 hover:bg-gray-200'
          }`}
        >
          Período
        </Button>
      </div>

      {/* 2. PRESETS */}
      {currentMode === 'range' && (
        <div className="mb-4 grid grid-cols-4 gap-1">
          {['Q1', 'Q2', 'Q3', 'Q4', 'S1', 'S2', 'ANO'].map((p) => (
            <Button
              key={p}
              onClick={() => applyPreset(p)}
              className={`h-7 text-[10px] font-bold border-none bg-gray-100 hover:bg-white text-slate-800 shadow-sm ${
                p === 'ANO' ? 'col-span-2' : ''
              }`}
            >
              {p}
            </Button>
          ))}
        </div>
      )}

      {/* 3. CALENDÁRIO FULL WIDTH */}
      <div className="w-full">
        <Calendar
          mode={currentMode as any}
          selected={(currentMode === 'single' ? singleDate : rangeDate) as any}
          onSelect={(currentMode === 'single' ? handleSingleSelect : handleRangeSelect) as any}
          locale={pt}
          // FORÇA override completo com !important
          className="w-full max-w-full p-4 bg-transparent border-none" 
          classNames={{
            months: "!flex !flex-col !w-full",
            month: "!space-y-4 !w-full",
            caption: "!flex !justify-center !pt-1 !relative !items-center !text-slate-900 !w-full !mb-4",
            caption_label: "!text-sm !font-black !uppercase !tracking-tight",
            nav: "!space-x-1 !flex !items-center",
            nav_button: "!h-7 !w-7 !bg-transparent hover:!bg-gray-400/50 !text-slate-900 !rounded-md !transition-colors !border !border-slate-400/30",
            // FORÇA tabela a ser 100% width
            table: "!w-full !max-w-full !border-collapse !table", 
            // Cabeçalho forçado a flex e distribuição igual
            head_row: "!flex !w-full !justify-between !mb-2", 
            head_cell: "!text-slate-600 !font-bold !text-[0.7rem] !uppercase !flex-1 !text-center !min-w-0",
            // Linhas dos dias forçadas a flex
            row: "!flex !w-full !mt-2 !justify-between !gap-0",
            // Célula com flex-1 forçado e sem width fixo
            cell: "!flex-1 !text-center !text-sm !p-0 !relative !min-w-0 focus-within:!relative focus-within:!z-20",
            // Botão do dia ocupa 100% da célula
            day: "!h-9 !w-full !p-0 !font-semibold !text-slate-900 !transition-all hover:!bg-slate-200 !rounded-md aria-selected:!text-white !min-w-0",
            // Estilos de seleção
            day_selected: currentMode === 'single' 
              ? "!bg-yellow-500 !text-white !font-bold hover:!bg-yellow-600 focus:!bg-yellow-600" 
              : "!bg-purple-600 !text-white !font-bold hover:!bg-purple-700 focus:!bg-purple-700",
            day_range_middle: "!bg-purple-200 !text-purple-900 !rounded-none",
            day_range_start: "!rounded-l-md !bg-purple-600 !text-white",
            day_range_end: "!rounded-r-md !bg-purple-600 !text-white",
            day_today: "!border-2 !border-slate-500 !text-slate-900 !font-bold",
            day_outside: "!text-slate-500 !opacity-30",
          }}
        />
      </div>

      {/* 4. LISTA DE EVENTOS */}
      <div className="flex justify-between items-center mt-8 mb-3 px-1">
        <h1 className="text-sm font-black uppercase text-slate-700 tracking-widest">Agenda</h1>
        <Image src="/moreDark.png" alt="more" width={18} height={18} className="opacity-50 hover:opacity-100 cursor-pointer" />
      </div>
      <div className="flex flex-col gap-3">
        {events.map((event) => (
          <div key={event.id} className="p-3 bg-gray-100 rounded-lg border-l-4 border-purple-500 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h1 className="font-bold text-slate-900 text-xs">{event.title}</h1>
              <span className="text-[10px] font-bold text-slate-500 italic">{event.time}</span>
            </div>
            <p className="text-slate-700 text-[11px] leading-tight">{event.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventCalendar;