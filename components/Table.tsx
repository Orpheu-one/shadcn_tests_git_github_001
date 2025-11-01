import React from "react";

type Column = { header: string; accessor: string; className?: string };

type TableProps<T> = {
  columns: Column[];
  renderRow: (item: T) => React.ReactNode;
  data: T[];
};

function Table<T>({ columns, renderRow, data }: TableProps<T>) {
  return (
    <table className='w-full mt-4'>
      <thead className="">

        <tr className="text-left text-gray-500 text-sm">
          {columns.map(col=> (
            <th key={col.accessor} className={col.className}>{col.header}</th>
          ))}
        </tr>

      </thead>
      <tbody>
        {data.map((item)=>renderRow(item))}
      </tbody>
    </table>
  )
}

export default Table