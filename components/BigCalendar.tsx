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
      views={{ month: false, week: true, day: true, agenda: false }}
      view={view}
      onView={handleViewChange}
      min={new Date(2025,1,0,10,0,0) }
      max={new Date(2025,1,0,20,0,0) }
    />

  )
}
export default BigCalendar