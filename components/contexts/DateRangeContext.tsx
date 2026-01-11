"use client"

import { createContext, useContext, useState, ReactNode } from 'react';

// ✅ Tipo para o range de datas
export type DateRange = [Date, Date] | null;

// ✅ Interface do Context
interface DateRangeContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  startDate: Date | null;
  endDate: Date | null;
}

// ✅ Cria o Context
const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

// ✅ Provider Component
export function DateRangeProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRange>(null);

  // Helper: Extrai start e end date do range
  const startDate = dateRange ? dateRange[0] : null;
  const endDate = dateRange ? dateRange[1] : null;

  return (
    <DateRangeContext.Provider value={{ dateRange, setDateRange, startDate, endDate }}>
      {children}
    </DateRangeContext.Provider>
  );
}

// ✅ Hook personalizado para usar o Context
export function useDateRange() {
  const context = useContext(DateRangeContext);
  if (context === undefined) {
    throw new Error('useDateRange must be used within a DateRangeProvider');
  }
  return context;
}