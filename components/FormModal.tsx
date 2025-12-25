"use client"

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteUserAction, deleteEventAction } from "@/lib/actions/user.actions";
import { toast } from "sonner";

// Imports dinâmicos
const OperadoresForm = dynamic(() => import("./Forms/OperadoresForm"), { ssr: false });
const VendasForm = dynamic(() => import("./Forms/VendasForm"), { ssr: false });

// O dicionário agora cobre todas as variações para garantir que nunca retorne "Não encontrado"
const forms: { [key: string]: (type: "create" | "edit", data: any, tableLabel: string, formId: string, id?: number, userId?: string) => JSX.Element } = {
  // Agora aceita "operador" (singular) que é o que a tua página está a enviar
  operador: (type, data, tableLabel, formId, id, userId) => (
    <OperadoresForm type={type} tableLabel={tableLabel} formId={formId} userId={userId} />
  ),
  operadores: (type, data, tableLabel, formId, id, userId) => (
    <OperadoresForm type={type} tableLabel={tableLabel} formId={formId} userId={userId} />
  ),
  operators: (type, data, tableLabel, formId, id, userId) => (
    <OperadoresForm type={type} tableLabel={tableLabel} formId={formId} userId={userId} />
  ),
  vendas: (type, data, tableLabel, formId, id, userId) => (
    <VendasForm type={type} data={data} tableLabel={tableLabel} formId={formId} eventId={id} />
  ),
  events: (type, data, tableLabel, formId, id, userId) => (
    <VendasForm type={type} data={data} tableLabel={tableLabel} formId={formId} eventId={id} />
  ),
};

const FormModal = ({ table, type, data, id, userId }: any) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor = type === "create" ? "bg-purple-600" : type === "edit" ? "bg-blue-400" : "bg-red-500";
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const tid = toast.loading("A eliminar...");
    try {
      // Ajustado para reconhecer tanto 'vendas' como 'events'
      const isEvent = table === "vendas" || table === "events";
      const res = isEvent ? await deleteEventAction(Number(id)) : await deleteUserAction(userId);
      
      if (res?.error) throw new Error(res.error);
      
      toast.success("Eliminado!", { id: tid });
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message, { id: tid });
    }
  };

  const Form = () => {
    const tableLabel = table.charAt(0).toUpperCase() + table.slice(1);
    const formId = `form-${table}-${type}`;

    if (type === "delete") {
      return (
        <div className="p-4 flex flex-col gap-4">
          <span className="text-center font-medium text-black">
            Tem a certeza que deseja eliminar este {tableLabel}?
          </span>
          <button 
            onClick={handleDelete} 
            className="bg-red-600 text-white py-2 px-4 rounded-md border-none w-max self-center"
          >
            Eliminar
          </button>
        </div>
      );
    }

    // Verificação de segurança no dicionário
    const SelectedForm = forms[table];

    return SelectedForm ? (
      <>
        {SelectedForm(type, data, tableLabel, formId, id as number, userId)}
        <button form={formId} className="bg-purple-600 text-white p-2 rounded-md mt-4 w-full">
            {type === "create" ? "Criar" : "Atualizar"}
        </button>
      </>
    ) : (
      <div className="p-4 text-red-500 text-center">
        Formulário não encontrado para a tabela: <strong>{table}</strong>
      </div>
    );
  };

  return (
    <>
      <button 
        className={`${size} flex items-center justify-center rounded-full ${bgColor}`} 
        onClick={() => setOpen(true)}
      >
        <Image src={`/${type}.png`} alt="" width={16} height={16} />
      </button>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] max-h-[90vh] overflow-y-auto">
            <Form />
            <div className="absolute top-4 right-4 cursor-pointer" onClick={() => setOpen(false)}>
              <Image src="/close.png" alt="" width={14} height={14} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;