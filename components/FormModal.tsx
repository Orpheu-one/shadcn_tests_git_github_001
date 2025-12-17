"use client"

import Image from "next/image";
import React, { JSX } from "react";
import dynamic from "next/dynamic";
import { UserRole } from '@prisma/client'; 

// --- DYNAMIC IMPORTS ---
const OperadoresForm = dynamic(() => import("./Forms/OperadoresForm"), { loading: () => <p>Loading...</p> });
const D2dForm = dynamic(() => import("./Forms/D2dForm"), { loading: () => <p>Loading...</p> });
const VendasForm = dynamic(() => import("./Forms/VendasForm"), { loading: () => <p>Loading...</p> });
const SupervisorsForm = dynamic(() => import("./Forms/SupervisorsForm"), { loading: () => <p>Loading...</p> }); 

// --- FORMS MAPPING ---
const forms: {
  [key: string]: (
    type: "create" | "edit",
    data: any,
    tableLabel: string,
    formId: string, 
    userRole: UserRole,
    eventId?: number // Added this parameter to the type definition
  ) => JSX.Element;
} = {
  operador: (t, d, l, id, role) => <OperadoresForm type={t} data={d} tableLabel={l!} formId={id} userRole={role} />,
  d2d: (t, d, l, id, role) => <D2dForm type={t} data={d} tableLabel={l!} formId={id} userRole={role} />,
  vendas: (t, d, l, id, role, eventId) => (
    <VendasForm 
      type={t} 
      data={d} 
      tableLabel={l!} 
      formId={id} 
      eventId={eventId} // Passing the id here to trigger the fetch in VendasForm
    />
  ),
  supervisor: (t, d, l, id, role) => <SupervisorsForm type={t} data={d} tableLabel={l!} formId={id} userRole={role} />,
};

// --- TYPES ---
type TableType = "d2d" | "operador" | "supervisor" | "vendas" | "projecto" | "resultado" | "callback";
type FormType = "create" | "edit" | "delete";

type FormModalProps = {
  table: TableType;
  type: FormType;
  data?: any;
  id?: number; // This id will be passed as eventId
  userRole: UserRole; 
};

// --- COMPONENT ---
const FormModal = ({ table, type, data, id, userRole }: FormModalProps) => {
  const [open, setOpen] = React.useState(false);
  
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor = type === "create" ? "bg-pink-300" : type === "edit" ? "bg-yellow-500" : "bg-red-500";

  const labelMap: Record<TableType, string> = {
    d2d: "Vendedor",
    operador: "Operador de Call",
    supervisor: "Supervisor",
    vendas: "Venda",
    projecto: "Projecto",
    resultado: "Resultado",
    callback: "Callback",
  };

  const getFormKey = (): string => {
    if (table === "vendas") {
      switch (userRole) {
        case UserRole.ADMIN:
        case UserRole.SUPERVISOR:
        case UserRole.OPERATOR: 
          return "vendas";
        case UserRole.D2D: 
          return "d2d"; 
        default: 
          return "vendas"; 
      }
    }
    return table; 
  };
  
  const formKey = getFormKey(); 
  const formId = `form-${table}-${type}`;

  const Form = () =>
    type === "delete" && id ? (
      <form action="" className="p-4 flex flex-col gap-4">
        <p>Quer eliminar este item? Esta operação não tem retorno.</p>
        <div className="flex gap-4 justify-end mt-4">
            <button type="button" onClick={() => setOpen(false)} className="bg-gray-300 text-gray-800 py-2 px-4 rounded-md">
                Cancelar
            </button>
            <button type="submit" className="bg-red-500 text-white py-2 px-4 rounded-md">
                Eliminar
            </button>
        </div>
      </form>
    ) : (
      // Passing 'id' as the 6th argument so it reaches VendasForm as eventId
      forms[formKey](type, data, labelMap[table], formId, userRole, id)
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
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-white w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] p-6 rounded-lg text-black relative flex flex-col max-h-[90vh] pointer-events-auto">
              
              <div className="overflow-y-auto pr-2 custom-scrollbar">
                  <Form />
              </div>

              {type !== "delete" && (
                <div className="mt-6 flex justify-between gap-4 pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => setOpen(false)}
                    className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancelar
                  </button>
                  
                  <button 
                    type="submit"
                    form={formId} 
                    className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition-colors"
                  >
                    {type === "create" ? "Criar" : "Salvar Alterações"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default FormModal;