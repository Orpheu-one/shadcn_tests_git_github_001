"use client";

import { Pie, PieChart, ResponsiveContainer } from "recharts";
import { useId } from "react";

const data01 = [
  { name: "Group A", value: 70, fill: "oklch(62.7% 0.265 303.9)" },
  { name: "Group B", value: 30, fill: "oklch(68.1% 0.162 75.834 )" },
  

];

export default function RetrievelGraph({
  isAnimationActive = true,
}: {
  isAnimationActive?: boolean;
}) {

  const uid=useId()
  return (
    <div className="w-full h-70 relative">
      <h1 className="text-xl font-semibold text-gray-700">Retrievel</h1>
      <ResponsiveContainer width="100%" height="100%">
      <PieChart key={uid}>
        <Pie
          data={data01}
          dataKey="value"
          startAngle={180}
          endAngle={0}
          cx="50%"
          cy="50%"
          innerRadius="60%"   // 👈 makes the 70 % “hole”
          outerRadius="90%"
          fill="#8884d8"
          isAnimationActive={isAnimationActive}
        />
        
      </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-[53%] left-[50%] transform -translate-x-[50%] -translate-y-[50%] text-[60px] font-bold text-gray-700 text-center">70%</div>
      <h1 className="font-semibold absolute bottom-20 left-0 right-0 m-auto text-center text-gray-500">
        Periodo de 03/11 a 09/11
      </h1>
    </div>
  );
}
