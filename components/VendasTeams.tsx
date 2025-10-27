"use client"
import { Bar, BarChart, Legend, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import React from "react";
import Image from "next/image";


const data = [
  {
    name: 'Mon',
    elite: 590,
    winner: 800,
   
  },
  {
    name: 'Tue',
    elite: 868,
    winner: 967,
   
  },
  {
    name: 'Wed',
    elite: 1397,
    winner: 800,
   
  },
  {
    name: 'Thu',
    elite: 1480,
    winner: 1200,
    
  },
  {
    name: 'Fri',
    elite: 1520,
    winner: 1108,
    
  },
  {
    name: 'Sat',
    elite: 1400,
    winner: 680,
    
  },
];

const VendasTeams = () => {
  return (
  <div className='w-full bg-white p-4 rounded-lg'>
      <div className="flex justify-between items-center ">
        <h1 className="text-lg font-semibold text-gray-500 mb-4">Vendas Equipas por Semana</h1>
        <Image src="/moreDark.png" alt="more" width={20} height={20} />
      </div>
      <div className="">
      <ResponsiveContainer width="100%" height={400}>
         <BarChart
      style={{ width: '100%', maxWidth: 'full', maxHeight: '80%', aspectRatio: 1.618 }}

      data={data}
      margin={{
        top: 5,
        right: 0,
        left: -5,
        bottom: 5,
      }}
    >
      
      <XAxis dataKey="name" axisLine={false} tickLine={false}/>
      <YAxis axisLine={false} tickLine={false}/>

      <Tooltip contentStyle={{borderRadius:"10px", border:"1px solid #eee", paddingTop:"0px", margin:"5px"}} />
      <Legend />
      <Bar dataKey="elite" fill="oklch(62.7% 0.265 303.9)" radius={[5,5,0,0]} activeBar={<Rectangle fill="oklch(50.7% 0.265 303.9)" stroke="oklch(62.7% 0.265 303.9)e" />} legendType="circle" />
      <Bar dataKey="winner" fill=" oklch(68.1% 0.162 75.834)" radius={[5,5,0,0]} activeBar={<Rectangle fill="  oklch(50.1% 0.162 75.834 )" stroke="oklch(68.1% 0.162 75.834)" />} legendType="circle"  />
    </BarChart>
    </ResponsiveContainer>
    </div>


  </div>
  )
}

export default VendasTeams