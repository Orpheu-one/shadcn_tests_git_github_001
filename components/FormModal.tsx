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
    id?: number, // ✅ ID do item (eventId ou userId)
  ) => JSX.Element;
} = {
  // ✅ Corrigido: passa 'id' como userId
  operador: (t, d, l, formId, role, id) => (
    <OperadoresForm 
      type={t} 
      data={d} 
      tableLabel={l} 
      formId={formId} 
      userId={id} // ✅ Agora passa o id correto
    />
  ),
  
  d2d: (t, d, l, formId, role, id) => (
    <D2dForm 
      type={t} 
      data={d} 
      tableLabel={l} 
      formId={formId} 
      userRole={role} 
    />
  ),
  
  // ✅ Vendas recebe 'id' como eventId
  vendas: (t, d, l, formId, role, id) => (
    <VendasForm 
      type={t} 
      data={d} 
      tableLabel={l} 
      formId={formId} 
      eventId={id} // ✅ Passa como eventId
    />
  ),
  
  supervisor: (t, d, l, formId, role, id) => (
    <SupervisorsForm 
      type={t} 
      data={d} 
      tableLabel={l} 
      formId={formId} 
      userRole={role} 
    />
  ),
};

// --- TYPES ---
type TableType = "d2d" | "operador" | "supervisor" | "vendas" | "projecto" | "resultado" | "callback" | "admin";
type FormType = "create" | "edit" | "delete";

type FormModalProps = {
  table: TableType;
  type: FormType;
  data?: any;
  id?: number; // ✅ ID genérico (eventId ou userId)
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
    admin: "Administrador",
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
  const formId = `form-${table}-${type}-${id || 'new'}`;

  const Form = () =>
    type === "delete" && id ? (
      <form action="" className="p-4 flex flex-col gap-4">
        <p>Quer eliminar este item? Esta operação não tem retorno.</p>
        <div className="flex gap-4 justify-end mt-4">
          <button 
            type="button" 
            onClick={() => setOpen(false)} 
            className="bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </form>
    ) : (
      // ✅ Passa todos os parâmetros na ordem correta
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
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black opacity-90 z-40" 
            onClick={() => setOpen(false)} 
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-white w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] p-6 rounded-lg text-black relative flex flex-col max-h-[90vh] pointer-events-auto">
              
              {/* Scrollable content */}
              <div className="overflow-y-auto pr-2 custom-scrollbar">
                <Form />
              </div>

              {/* Action buttons (não mostrar em delete) */}
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