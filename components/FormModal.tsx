"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { deleteUserAction, deleteEventAction, getOperatorById, getEventById } from "@/lib/actions/user.actions";
import { JSX } from "react";
import { toast } from "sonner";

// Imports Dinâmicos
const OperadoresForm = dynamic(() => import("./Forms/OperadoresForm"), { ssr: false });
const VendasForm = dynamic(() => import("./Forms/VendasForm"), { ssr: false });
const CallbacksForm = dynamic(() => import("./Forms/CallbacksForm"), { ssr: false });
const SupervisoresForm = dynamic(() => import("./Forms/SupervisorsForm"), { ssr: false });
const AdministradoresForm = dynamic(() => import("./Forms/AdministradoresForm"), { ssr: false });

type DeleteConfirmData = {
  type: 'user' | 'event';
  displayName: string;
  displayInfo: string;
} | null;

// Mapeamento dos Formulários
const forms: { 
  [key: string]: (
    type: "create" | "edit", 
    tableLabel: string, 
    formId: string, 
    id?: number, 
    userId?: string,
    onSuccess?: () => void,
    data?: any  // ✅ ADICIONADO: Para passar dados do calendário
  ) => JSX.Element 
} = {
  operador: (type, tableLabel, formId, id, userId, onSuccess) => (
    <OperadoresForm type={type} tableLabel={tableLabel} formId={formId} userId={userId} onSuccess={onSuccess} />
  ),
  operadores: (type, tableLabel, formId, id, userId, onSuccess) => (
    <OperadoresForm type={type} tableLabel={tableLabel} formId={formId} userId={userId} onSuccess={onSuccess} />
  ),
  vendas: (type, tableLabel, formId, id, userId, onSuccess, data) => (
    <VendasForm type={type} tableLabel={tableLabel} formId={formId} eventId={id} onSuccess={onSuccess} initialData={data} />
  ),
  callbacks: (type, tableLabel, formId, id, userId, onSuccess, data) => (
    <CallbacksForm type={type} tableLabel={tableLabel} formId={formId} eventId={id} onSuccess={onSuccess} initialData={data} />
  ),
  events: (type, tableLabel, formId, id, userId, onSuccess, data) => (
    <VendasForm type={type} tableLabel={tableLabel} formId={formId} eventId={id} onSuccess={onSuccess} initialData={data} />
  ),
  supervisores: (type, tableLabel, formId, id, userId, onSuccess) => (
    <SupervisoresForm type={type} tableLabel={tableLabel} formId={formId} userId={userId} onSuccess={onSuccess} />
  ),
  administradores: (type, tableLabel, formId, id, userId, onSuccess) => (
    <AdministradoresForm type={type} tableLabel={tableLabel} formId={formId} userId={userId} onSuccess={onSuccess} />
  )
};

const FormModal = ({ table, type, data, id, userId, forcedOpen, onClose }: any) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor = type === "create" ? "bg-purple-600" : type === "edit" ? "bg-blue-400" : "bg-red-500";
  const [open, setOpen] = useState(false);
  const [deleteData, setDeleteData] = useState<DeleteConfirmData>(null);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  // =========================================================
  // LÓGICA DE PERMISSÃO
  // =========================================================
  const canCreate = () => {
    if (type !== "create") return true;
    const userRole = (user?.publicMetadata?.role as string)?.toLowerCase();

    // Permite Operadores e Vendedores criarem Vendas/Events/Callbacks
    if (table === "vendas" || table === "events" || table === "callbacks") {
      return ["admin", "super-admin", "supervisor", "operador", "vendedor"].includes(userRole || "");
    }

    // Para criar USERS (Operadores, Admins), mantém restrito
    return ["admin", "super-admin", "supervisor"].includes(userRole || "");
  };

  // =========================================================
  // SUPORTE PARA ABERTURA AUTOMÁTICA (BIG CALENDAR)
  // =========================================================
  useEffect(() => {
    if (forcedOpen) {
      if (canCreate()) {
        setOpen(true);
      } else {
        toast.error("Sem permissão para realizar esta acção.");
        if (onClose) onClose(); // ✅ Fecha se não tiver permissão
      }
    }
  }, [forcedOpen]);

  // Lógica de Carregamento para Delete
  useEffect(() => {
    if (type === "delete" && open) {
      const fetchDeleteData = async () => {
        setIsLoadingDelete(true);
        try {
          const isEvent = table === "vendas" || table === "events" || table === "callbacks";
          if (isEvent && id) {
            const eventData = await getEventById(Number(id));
            if (eventData) {
              setDeleteData({
                type: 'event',
                displayName: `${eventData.client.frst_name} ${eventData.client.lst_name || ''}`,
                displayInfo: `ID: ${eventData.event_id} | Operador: ${eventData.user.frst_name}`,
              });
            }
          } else {
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

  const handleDelete = async () => {
    const tid = toast.loading("A eliminar...");
    try {
      const isEvent = table === "vendas" || table === "events" || table === "callbacks";
      const res = isEvent 
        ? await deleteEventAction(Number(id)) 
        : await deleteUserAction(userId || id);
      if (res?.error) throw new Error(res.error);
      toast.success("Eliminado com sucesso!", { id: tid });
      handleCloseModal();
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

  const handleCloseModal = () => {
    setOpen(false);
    if (onClose) onClose(); // ✅ Callback para BigCalendar
  };

  const handleFormSuccess = () => {
    handleCloseModal();
    router.refresh();
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
              onClick={handleCloseModal}
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
        {/* ✅ Passa 'data' para o form pré-preencher campos */}
        {SelectedForm(type, tableLabel, formId, id as number, userId, handleFormSuccess, data)}
        
        {/* Botões de Acção do Rodapé */}
        <div className="flex gap-3 mt-4">
          <button 
            type="button"
            onClick={handleCloseModal}
            className="bg-gray-200 text-gray-800 py-2 px-6 rounded-md hover:bg-gray-500 hover:text-white transition flex-1"
          >
            Cancelar
          </button>
          <button 
            form={formId} 
            type="submit"
            className="bg-purple-600 text-white py-2 px-6 rounded-md hover:bg-purple-700 transition flex-1"
          >
            {type === "create" ? "Criar" : "Atualizar"}
          </button>
        </div>
      </>
    ) : (
      <div className="p-4 text-red-500 text-center">
        Formulário não encontrado para: <strong>{table}</strong>
      </div>
    );
  };

  return (
    <>
      {/* Botão de Trigger (Só renderiza se não for abertura forçada) */}
      {!forcedOpen && (
        <button 
          className={`${size} flex items-center justify-center rounded-full ${bgColor} hover:opacity-90 transition`} 
          onClick={handleOpenModal}
        >
          <Image src={`/${type}.png`} alt="" width={16} height={16} />
        </button>
      )}

      {open && !forcedOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] max-h-[90vh] overflow-y-auto">
            <Form />
          </div>
        </div>
      )}

      {/* ✅ Quando forcedOpen=true (BigCalendar), só renderiza o Form */}
      {forcedOpen && <Form />}
    </>
  );
};

export default FormModal;