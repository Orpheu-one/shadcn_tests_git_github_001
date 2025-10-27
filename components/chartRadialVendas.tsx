"use client"

import Image from 'next/image';
import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

const data = [
  {
    name: 'Total',
    count: 100,  
    fill: '#fff',
  },
  {
    name: 'Team B',
    count: 50,
    fill: 'oklch(62.7% 0.265 303.9)',
  },

  {
    name: 'Team A',
    count: 75,
    fill: '#ffc658',
  },
]


const ChartRadialVendas = () => {
  return (
    <div className='w-full'>
        {/*Title*/}
        <div className="flex justify-between items-center p-2">
            <h1 className="text-lg font-semibold text-gray-500">Operadores</h1>
            <Image src="/moreDark.png" alt="more" width={20} height={20} />

        </div>
        {/*Chart*/}
        <div className="relative flex items-center">
    <ResponsiveContainer width="100%" height={250}>
        
            <RadialBarChart
      style={{ width: '100%', maxWidth: '700px', maxHeight: '100vh', aspectRatio: 1 }}
       innerRadius={40}
       outerRadius={100}
      cx="50%"
      barSize={30}
      data={data}
    >
      <RadialBar label={{ position: 'insideStart', fill: 'transparent' }} background dataKey="count" />
      
    </RadialBarChart>
</ResponsiveContainer>
<Image src="/maleFemale.png" alt="" className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' width={50} height={50}/>
        </div>
        {/*Footer*/}
        <div className="flex justify-center gap-16 ">
            <div className="flex flex-col items-center gap-1 ">
                <div className="w-7 h-7 dark:bg-purple-500 rounded-full"></div>
                
                    <h1 className="font-bold text-black">1.234</h1>

                    <h2 className="text-sm text-gray-500">Team</h2>
                
                
            </div>

            <div className="flex items-center flex-col gap-1">
                <div className="w-7 h-7 dark:bg-yellow-600 rounded-full"></div>
                    <h1 className="font-bold text-black">1.234</h1>

                    <h2 className="text-sm text-gray-500">Team</h2>

                
            </div>

        </div>
    </div>
  )
}

export default ChartRadialVendas