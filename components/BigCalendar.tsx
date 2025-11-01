"use client"

import { Calendar, dayjsLocalizer, View } from 'react-big-calendar'
import dayjs from 'dayjs'
import { useState } from 'react'
import { calendarEvents } from '@/lib/data'

const localizer = dayjsLocalizer(dayjs)

const BigCalendar = () => {

  const [view,setView] = useState<View>('week');

  const handleViewChange = (newView: View) => {
    setView(newView);
  }
  return(

  
    <Calendar
      localizer={localizer}
      events={calendarEvents}
      startAccessor="start"
      endAccessor="end"
      style={{ height: "100%", width: "100%" }}
      view={view}
      onView={handleViewChange}
      views={{ month: false, week: true, day: true, agenda: false }}
      min={new Date(0, 0, 0, 10, 0, 0)}   // 10:00
      max={new Date(0, 0, 0, 20, 0, 0)}   // 20:00

    />

  )
}
export default BigCalendar