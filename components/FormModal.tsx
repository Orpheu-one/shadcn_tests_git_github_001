"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { deleteUserAction, deleteEventAction, getOperatorById, getEventById } from "@/lib/actions/user.actions";
import { toast } from "sonner";

// Dynamic imports
const OperadoresForm = dynamic(() => import("./Forms/OperadoresForm"), { ssr: false });
const VendasForm = dynamic(() => import("./Forms/VendasForm"), { ssr: false });

// Types para dados de confirmação
type DeleteConfirmData = {
  type: 'user' | 'event';
  displayName: string;
  displayInfo: string;
} | null;

const forms: { 
  [key: string]: (
    type: "create" | "edit", 
    tableLabel: string, 
    formId: string, 
    id?: number, 
    userId?: string
  ) => JSX.Element 
} = {
  operador: (type, tableLabel, formId, id, userId) => (
    <OperadoresForm type={type} tableLabel={tableLabel} formId={formId} userId={userId} />
  ),
  operadores: (type, tableLabel, formId, id, userId) => (
    <OperadoresForm type={type} tableLabel={tableLabel} formId={formId} userId={userId} />
  ),
  vendas: (type, tableLabel, formId, id, userId) => (
    <VendasForm type={type} tableLabel={tableLabel} formId={formId} eventId={id} />
  ),
  events: (type, tableLabel, formId, id, userId) => (
    <VendasForm type={type} tableLabel={tableLabel} formId={formId} eventId={id} />
  ),
};

const FormModal = ({ table, type, data, id, userId }: any) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor = type === "create" ? "bg-purple-600" : type === "edit" ? "bg-blue-400" : "bg-red-500";
  const [open, setOpen] = useState(false);
  const [deleteData, setDeleteData] = useState<DeleteConfirmData>(null);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  // Check permissions
  const canCreate = () => {
    if (type !== "create") return true;
    const userRole = (user?.publicMetadata?.role as string)?.toLowerCase();
    return userRole === "admin" || userRole === "supervisor";
  };

  // Fetch data for delete confirmation (CORRIGIDO PARA UTILIZADORES)
  useEffect(() => {
    if (type === "delete" && open) {
      const fetchDeleteData = async () => {
        setIsLoadingDelete(true);
        try {
          const isEvent = table === "vendas" || table === "events";
          
          if (isEvent && id) {
            const eventData = await getEventById(Number(id));
            if (eventData) {
              setDeleteData({
                type: 'event',
                displayName: `${eventData.client.frst_name} ${eventData.client.lst_name || ''}`,
                displayInfo: `ID: ${eventData.eventIdString} | Operador: ${eventData.operator.frst_name}`,
              });
            }
          } else {
            // Lógica robusta: tenta buscar por userId ou por id (DB)
            const targetId = userId || id;
            if (targetId) {
              const userData = await getOperatorById(targetId);
              if (userData) {
                setDeleteData({
                  type: 'user',
                  displayName: `${userData.frst_name} ${userData.lst_name}`,
                  displayInfo: `ID: ${userData.internalId} | Email: ${userData.email} | Role: ${userData.role}`,
                });
              }
            }
          }
        } catch (error) {
          console.error("Erro ao carregar dados:", error);
        } finally {
          setIsLoadingDelete(false);
        }
      };
      fetchDeleteData();
    }
  }, [type, open, table, id, userId]);

  // Handle Delete (CORRIGIDO PARA UTILIZADORES)
  const handleDelete = async () => {
    const tid = toast.loading("A eliminar...");
    try {
      const isEvent = table === "vendas" || table === "events";
      
      // Enviamos o userId se existir, senão enviamos o id. 
      // A action findUser no servidor tratará de ambos.
      const res = isEvent 
        ? await deleteEventAction(Number(id)) 
        : await deleteUserAction(userId || id);
        
      if (res?.error) throw new Error(res.error);
      
      toast.success("Eliminado com sucesso!", { id: tid });
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message, { id: tid });
    }
  };

  const handleOpenModal = () => {
    if (!canCreate()) {
      toast.error("Não tem permissões para criar");
      return;
    }
    setOpen(true);
  };

  const Form = () => {
    const tableLabel = table.charAt(0).toUpperCase() + table.slice(1);
    const formId = `form-${table}-${type}`;

    if (type === "delete") {
      return (
        <div className="p-6 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-gray-800 text-center">
            Confirmar Eliminação
          </h2>
          
          {isLoadingDelete ? (
            <div className="text-center py-8">
              <p className="text-gray-600 animate-pulse">A carregar dados...</p>
            </div>
          ) : deleteData ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Tem certeza que deseja eliminar:</p>
              <p className="text-lg font-bold text-gray-900">{deleteData.displayName}</p>
              <p className="text-sm text-gray-600 mt-2">{deleteData.displayInfo}</p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-center text-gray-600">Não foi possível carregar os dados para eliminar.</p>
            </div>
          )}

          <div className="flex gap-3 justify-center mt-4">
            <button 
              onClick={() => setOpen(false)}
              className="bg-gray-300 text-gray-800 py-2 px-6 rounded-md hover:bg-gray-400 transition"
            >
              Cancelar
            </button>
            <button 
              onClick={handleDelete}
              disabled={isLoadingDelete || !deleteData}
              className="bg-red-600 text-white py-2 px-6 rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Eliminar
            </button>
          </div>
        </div>
      );
    }

    const SelectedForm = forms[table];

    return SelectedForm ? (
      <>
        {SelectedForm(type, tableLabel, formId, id as number, userId)}
        <button form={formId} className="bg-purple-600 text-white p-2 rounded-md mt-4 w-full hover:bg-purple-700 transition">
          {type === "create" ? "Criar" : "Atualizar"}
        </button>
      </>
    ) : (
      <div className="p-4 text-red-500 text-center">
        Formulário não encontrado para: <strong>{table}</strong>
      </div>
    );
  };

  return (
    <>
      <button 
        className={`${size} flex items-center justify-center rounded-full ${bgColor} hover:opacity-90 transition`} 
        onClick={handleOpenModal}
      >
        <Image src={`/${type}.png`} alt="" width={16} height={16} />
      </button>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] max-h-[90vh] overflow-y-auto">
            <Form />
            <div className="absolute top-4 right-4 cursor-pointer hover:bg-gray-100 rounded-full p-1 transition" onClick={() => setOpen(false)}>
              <Image src="/close.png" alt="" width={14} height={14} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;