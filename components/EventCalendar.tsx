"use client"

import Image from "next/image";
import { useState } from "react";
import { Calendar } from "react-calendar";


type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

{/*REMP EVENT LIST*/ }

const events = [

  { id: "1", title: "Event 1", time: "12:00-PM 14:00 PM", desc:"this is a description" },
  { id: "2", title: "Event 2", time: "12:00-PM 14:00 PM", desc:"this is a description" },
  { id: "3", title: "Event 3", time: "12:00-PM 14:00 PM", desc:"this is a description" },

]

const EventCalendar = () => {

    const [value, onChange] = useState<Value>(new Date());


  return (
    
    <div className='bg-white p-4 rounded-lg text-black'>
        
        <Calendar onChange={onChange}
         value={value}
         locale="en-EN"                                    // English (United States)
        formatShortWeekday={(locale, date) =>
          date
            .toLocaleDateString(locale, { weekday: "short" })
            .replace(".", "")                             // remove the dot that en-EN adds
        } />

        <div className="flex justify-between items-center">
            <h1 className="text-lg font-bold mt-4">Events</h1>
            <Image src="/moreDark.png" alt="more" width={20} height={20} className=""/>
        </div>
        <div className="flex flex-col gap-4">

          {events.map((event) => (
            <div key={event.id} className="">
              <div className="p-4 border-2 border-t-4 odd:border-t-purple-500 even:border-t-yellow-600">
                <div className="flex items-center justify-between gap-1">
                  <h1 className="font-semibold  text-gray-600 ">{event.title}</h1>
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