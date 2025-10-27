"use client"

import { useState } from "react";
import { Calendar } from "react-calendar";


type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

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
        
        
    </div>
  )
  
}

export default EventCalendar