"use client"

import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useDateRange } from "@/components/contexts/DateRangeContext";
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  addMonths,
  subMonths,
  format, 
  isSameMonth, 
  isSameDay,
  isWithinInterval,
  startOfYear,
  endOfYear
} from "date-fns";
import { pt } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

const events = [
  { id: "1", title: "Event 1", time: "12:00-PM 14:00 PM", desc: "this is a description" },
  { id: "2", title: "Event 2", time: "12:00-PM 14:00 PM", desc: "this is a description" },
  { id: "3", title: "Event 3", time: "12:00-PM 14:00 PM", desc: "this is a description" },
];

interface CustomCalendarProps {
  onDateSelect?: (date: Date) => void;
  showModeToggle?: boolean;
  showPresets?: boolean;
  showEvents?: boolean;
  defaultMode?: 'single' | 'range';
}

const CustomCalendar = ({ 
  onDateSelect,
  showModeToggle = true,
  showPresets = true,
  showEvents = true,
  defaultMode = 'single'
}: CustomCalendarProps) => {
  const [currentMode, setCurrentMode] = useState<'single' | 'range'>(defaultMode);
  const { setDateRange } = useDateRange();
  const [singleDate, setSingleDate] = useState<Date | undefined>(undefined);
  const [rangeStart, setRangeStart] = useState<Date | undefined>(undefined);
  const [rangeEnd, setRangeEnd] = useState<Date | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) {
    return <div className="w-full h-[500px] bg-gray-300 rounded-xl animate-pulse" />;
  }

  const toggleMode = () => {
    setCurrentMode(prev => (prev === 'single' ? 'range' : 'single'));
    setSingleDate(undefined);
    setRangeStart(undefined);
    setRangeEnd(undefined);
  };

  const handleDateClick = (day: Date) => {
    if (currentMode === 'single') {
      setSingleDate(day);
      setDateRange([day, day]);
      if (onDateSelect) onDateSelect(day);
    } else {
      // Range mode logic
      if (!rangeStart || (rangeStart && rangeEnd)) {
        // Start new range
        setRangeStart(day);
        setRangeEnd(undefined);
      } else {
        // Complete range
        if (day < rangeStart) {
          setRangeEnd(rangeStart);
          setRangeStart(day);
          setDateRange([day, rangeStart]);
        } else {
          setRangeEnd(day);
          setDateRange([rangeStart, day]);
        }
      }
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
    setRangeStart(from);
    setRangeEnd(to);
    setDateRange([from, to]);
  };

  // Generate calendar days - COMEÇA À SEGUNDA-FEIRA
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // 1 = Segunda-feira
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  const days = generateCalendarDays();
  const weekDays = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']; // Segunda a Domingo

  const getDayClassName = (day: Date) => {
    const baseClasses = "flex items-center justify-center h-9 w-full font-semibold text-slate-900 transition-all rounded-md cursor-pointer hover:bg-slate-200";
    
    let classes = baseClasses;

    // Fins de semana (Sábado = 6, Domingo = 0)
    const dayOfWeek = day.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      classes += " !text-slate-400 opacity-60";
    }

    // Outside month
    if (!isSameMonth(day, currentMonth)) {
      classes += " text-slate-400 opacity-40";
    }

    // Today
    if (isSameDay(day, new Date())) {
      classes += " border-2 border-slate-500 font-bold";
    }

    // Single mode selection
    if (currentMode === 'single' && singleDate && isSameDay(day, singleDate)) {
      classes += " !bg-yellow-500 !text-white hover:!bg-yellow-600";
    }

    // Range mode selection
    if (currentMode === 'range') {
      if (rangeStart && isSameDay(day, rangeStart)) {
        classes += " !bg-purple-600 !text-white rounded-l-md hover:!bg-purple-700";
      }
      if (rangeEnd && isSameDay(day, rangeEnd)) {
        classes += " !bg-purple-600 !text-white rounded-r-md hover:!bg-purple-700";
      }
      if (rangeStart && rangeEnd && isWithinInterval(day, { start: rangeStart, end: rangeEnd })) {
        if (!isSameDay(day, rangeStart) && !isSameDay(day, rangeEnd)) {
          classes += " !bg-purple-200 !text-purple-900 rounded-none";
        }
      }
    }

    return classes;
  };

  // Split days into weeks
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="bg-gray-300 p-4 rounded-xl w-full shadow-sm text-slate-900 border-none">
      {/* 1. MODO TOGGLE - Condicional */}
      {showModeToggle && (
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
      )}

      {/* 2. PRESETS - Condicional */}
      {showPresets && currentMode === 'range' && (
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

      {/* 3. CALENDÁRIO CUSTOM */}
      <div className="w-full bg-transparent">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-4 px-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="h-7 w-7 bg-transparent hover:bg-gray-400/50 text-slate-900 rounded-md transition-colors border border-slate-400/30"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-sm font-black uppercase tracking-tight text-slate-900">
            {format(currentMonth, 'MMMM yyyy', { locale: pt })}
          </h2>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="h-7 w-7 bg-transparent hover:bg-gray-400/50 text-slate-900 rounded-md transition-colors border border-slate-400/30"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Week days header */}
        <div className="grid grid-cols-7 gap-0 mb-2">
          {weekDays.map((day, idx) => (
            <div key={idx} className="text-center text-slate-600 font-bold text-[0.7rem] uppercase">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="flex flex-col gap-2">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="grid grid-cols-7 gap-0">
              {week.map((day, dayIdx) => (
                <div key={dayIdx} className="flex items-center justify-center">
                  <div
                    onClick={() => handleDateClick(day)}
                    className={getDayClassName(day)}
                  >
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 4. LISTA DE EVENTOS - Condicional */}
      {showEvents && (
        <>
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
        </>
      )}
    </div>
  );
};

export default CustomCalendar;