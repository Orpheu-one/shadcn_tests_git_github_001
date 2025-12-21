"use client"

import Image from "next/image";
import React, { JSX, useState } from "react";
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
    id?: number,
    userId?: string,
  ) => JSX.Element;
} = {
  // ✅ OPERADOR: Passa userId (string)
  operador: (t, d, l, formId, role, id, userId) => {
    console.log('🎯 FormModal - Operador:', { type: t, userId });
    return (
      <OperadoresForm 
        type={t} 
        data={d} 
        tableLabel={l} 
        formId={formId} 
        userId={userId}
      />
    );
  },
  
  // D2D
  d2d: (t, d, l, formId, role, id, userId) => (
    <D2dForm 
      type={t} 
      data={d} 
      tableLabel={l} 
      formId={formId} 
      userRole={role} 
    />
  ),
  
  // ✅ VENDAS: Passa id (number) como eventId
  vendas: (t, d, l, formId, role, id, userId) => {
    console.log('🎯 FormModal - Vendas:', { type: t, eventId: id });
    return (
      <VendasForm 
        type={t} 
        data={d} 
        tableLabel={l} 
        formId={formId} 
        eventId={id}
      />
    );
  },
  
  // SUPERVISOR
  supervisor: (t, d, l, formId, role, id, userId) => (
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
  id?: number; // eventId para vendas
  userId?: string; // userId (Clerk ID) para operadores
  userRole?: UserRole;
};

// --- COMPONENT ---
const FormModal = ({ table, type, data, id, userId, userRole = UserRole.OPERATOR }: FormModalProps) => {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  console.log('🚀 FormModal props:', { 
    table, 
    type, 
    id, 
    userId,
    userRole, 
    idType: typeof id,
    userIdType: typeof userId 
  });
  
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
  const formId = `form-${table}-${type}-${userId || id || 'new'}`;

  console.log('🔑 Form key:', formKey, 'Form ID:', formId);

  // ✅ DELETE HANDLER
  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      let endpoint = "";
      const itemId = userId || id;
      
      switch (table) {
        case "operador":
        case "supervisor":
        case "d2d":
          endpoint = `/api/operators/${itemId}`;
          break;
        case "vendas":
          endpoint = `/api/events/${itemId}`;
          break;
        default:
          endpoint = `/api/${table}s/${itemId}`;
      }

      console.log('🗑️ Eliminando:', { table, itemId, endpoint });

      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || 'Erro ao eliminar');
      }

      console.log('✅ Eliminado com sucesso');
      alert('Eliminado com sucesso!');
      window.location.reload();

    } catch (error) {
      console.error('❌ Erro ao eliminar:', error);
      alert(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsDeleting(false);
      setOpen(false);
    }
  };

  const Form = () => {
    // ✅ DELETE CONFIRMATION
    if (type === "delete") {
      return (
        <div className="p-4 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-red-600">
            ⚠️ Confirmar Eliminação
          </h2>
          
          <p className="text-gray-700">
            Tem a certeza que quer eliminar este item?
            <br />
            <strong>Esta operação não tem retorno!</strong>
          </p>

          <div className="flex gap-4 justify-end mt-4">
            <button 
              type="button" 
              onClick={() => setOpen(false)}
              disabled={isDeleting}
              className="bg-gray-300 text-gray-800 py-2 px-6 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            
            <button 
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 text-white py-2 px-6 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  A eliminar...
                </>
              ) : (
                'Eliminar'
              )}
            </button>
          </div>
        </div>
      );
    }
    
    // ✅ CREATE/EDIT FORMS
    return forms[formKey](type, data, labelMap[table], formId, userRole, id, userId);
  };

  return (
    <>
      <button
        className={`flex items-center justify-center rounded-full ${size} ${bgColor}`}
        onClick={() => {
          console.log('🖱️ Button clicked:', { table, type, id, userId });
          setOpen(true);
        }}
      >
        <Image src={`/${type}.png`} alt={type} width={13} height={13} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black opacity-90 z-40" 
            onClick={() => !isDeleting && setOpen(false)} 
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-white w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] p-6 rounded-lg text-black relative flex flex-col max-h-[90vh] pointer-events-auto">
              
              {/* Scrollable content */}
              <div className="overflow-y-auto pr-2 custom-scrollbar">
                <Form />
              </div>

              {/* Action buttons (apenas para create/edit) */}
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