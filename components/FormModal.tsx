"use client"

import Image from "next/image";
import React, { JSX } from "react";
import dynamic from "next/dynamic";

const OperadoresForm = dynamic(() => import("./Forms/OperadoresForm"), {
  loading: () => <p>Loading...</p>, 
});

const D2dForm = dynamic(() => import("./Forms/OperadoresForm"), {
  loading: () => <p>Loading...</p>, 
});

const forms: {
  [key: string]: (
    type: "create" | "edit",
    data?: unknown,
    tableLabel?: string
  ) => JSX.Element;
} = {
  d2d: (t, d, l) => <D2dForm type={t} data={d} tableLabel={l!} />,
  operador: (t, d, l) => <OperadoresForm type={t} data={d} tableLabel={l!} />,
};

type TableType = "d2d" | "operador" | "supervisor" | "venda" | "projecto" | "resultado" | "callback";
type FormType = "create" | "edit" | "delete";

type FormModalProps = {
  table: TableType;
  type: FormType;
  data?: unknown;
  id?: number;
};

const FormModal = ({ table, type, data, id }: FormModalProps) => {
  const [open, setOpen] = React.useState(false);
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create" ? "bg-pink-300" : type === "edit" ? "bg-yellow-500" : "bg-red-500";

  const labelMap: Record<TableType, string> = {
    d2d: "Vendedor",
    operador: "Operador",
    supervisor: "Supervisor",
    venda: "Venda",
    projecto: "Projecto",
    resultado: "Resultado",
    callback: "Callback",
  };

  const Form = () =>
    type === "delete" && id ? (
      <form action="" className="p-4 flex flex-col gap-4">
        <p className="text-center font-medium">Are you sure you want to delete this {table}?</p>
        <div className="flex justify-center mt-4">
          <button
            type="submit"
            className="bg-red-700 text-white py-2 px-4 rounded-md border-none cursor-pointer hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </form>
    ) : (
      forms[table](type, data, labelMap[table])
    );

  return (
    <>
      <button
        className={`flex items-center justify-center rounded-full ${size} ${bgColor}`}
        onClick={() => setOpen(true)}
      >
        <Image src={`/${type}.png`} alt={type} width={13} height={13} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black opacity-90 z-40" onClick={() => setOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] p-4 rounded-lg text-black relative">
              <Form />
              <div className="absolute top-4 right-4">
                <Image
                  src="/close.png"
                  alt="Close"
                  width={15}
                  height={15}
                  className="cursor-pointer"
                  onClick={() => setOpen(false)}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default FormModal;
