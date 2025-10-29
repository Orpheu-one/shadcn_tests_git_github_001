"use client"
import Image from "next/image"
import { ResponsiveContainer, Legend, AreaChart, Area, Tooltip, XAxis, YAxis } from 'recharts';

// #region Sample data
// We keep the original variable name 'data'
const data = [
  {
    name: 'Mon',
    elite: 4000,
    winner: 2400,
    
  },
  {
    name: 'Tue',
    elite: 3000,
    winner: 1398,
  },
  {
    name: 'Wed',
    elite: 2000,
    winner: 9800,
    
  },
  {
    name: 'Thu',
    elite: 2780,
    winner: 3908,
   
  },
  {
    name: 'Fri',
    elite: 1890,
    winner: 4800,
    
  },
  {
    name: 'Sat',
    elite: 2390,
    winner: 3800,
    
  },
 
];

// #endregion

// 1. Define a function to transform the data, using the variable name 'transformData' 
//    to avoid conflict with the field name 'total'.
// Define interfaces for the data structure
interface DataItem {
    name: string;
    winner: number;
    elite: number;
}

interface TransformedDataItem extends DataItem {
    total: number;
}

const transformData = (originalData: DataItem[]): TransformedDataItem[] => {
    // Use map to iterate and create a new array with the 'total' field added to each object
    return originalData.map(item => ({
        ...item,
        // Calculate and add the 'total' field
        total: item.winner + item.elite 
    }));
};

// 2. Create a new variable to hold the transformed, chart-ready data.
//    We'll name this chartData to avoid renaming your original 'data' array.
const chartData = transformData(data);


const TotalVendas = () => {
  // NOTE: The placeholder function 'const total = (uv,pv) => {};' is now unnecessary 
  // and has been effectively replaced by the 'transformData' logic above.
  
  return (
    <div className='w-full bg-white p-4 rounded-lg'>
      <div className="flex justify-between items-center ">
        <h1 className="text-lg font-semibold text-gray-500 mb-4">Vendas Equipas por Semana</h1>
        <Image src="/moreDark.png" alt="more" width={20} height={20} />
      </div>
      <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>

        <AreaChart
      // You must pass the transformed data 'chartData' here, not the original 'data'
      data={chartData} 
      style={{ width: '100%', maxWidth: '900px', height: '350px', maxHeight: '400px', aspectRatio: 1 }}
      margin={{
        top: 0,
        right: 0,
        left: 0,
        bottom: 20,
      }}
    >
      
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip contentStyle={{borderRadius:"10px", border:"1px solid #eee", paddingTop:"0px", margin:"5px"}}/>
      <Legend align="right" verticalAlign="top" wrapperStyle={{paddingBottom:"10px"}}/>
      
      {/* UV line */}
      <Area type="monotone" dataKey="elite" stackId="1" stroke="oklch(62.7% 0.265 303.9)" fill="oklch(62.7% 0.265 303.9)" name="elite" legendType="circle" color="oklch(62.7% 0.265 303.9)"/>
      
      {/* PV line */}
      <Area type="monotone" dataKey="winner" stackId="1" stroke="oklch(68.1% 0.162 75.834 )" fill="oklch(68.1% 0.162 75.834 )" name="winner" legendType="circle"/>

      {/* Total line - dataKey now matches the calculated field in 'chartData' */}
      <Area type="monotone" dataKey="total" stackId="1" stroke="oklch(0.7 0.1142 38.41)" fill="oklch(0.7 0.1142 38.41)" name="total" legendType="circle"/>
      
    </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default TotalVendas