"use client"

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState, useEffect, useCallback, useTransition } from 'react'; 
import InputField from '../InputField'; 
import DateTime from '../DateTime';
import VendasSwitches, { VendaStatus } from '../VendasSwitches';
import { createEvent, updateEvent, getEventById, getOperatorsList } from '@/lib/actions/user.actions';
import { toast } from 'sonner';
import { EventType, EventChannel, EventStatus } from '@prisma/client';
import { useUser } from '@clerk/nextjs';

// --- TYPES ---
type FetchedOperator = {
  id: number;
  userId: string;
  internalId: string;
  frst_name: string;
  lst_name: string;
  role: string;
}

type FetchedEventData = {
  eventId: number;
  eventIdString: string;
  createdAt: string;
  type: 'SALE' | 'CALLBACK';
  channel: 'REMOTE' | 'F2F';
  status: 'PROJECT' | 'CLOSED' | 'LOST';
  obs: string | null;
  operator: FetchedOperator;
  client: {
    frst_name: string;
    lst_name: string | null;
    email: string | null;
    phone: string;
    address: string;
  };
}

// --- ZOD SCHEMA ---
const schema = z.object({
  name: z.string().min(3, { message: "Nome obrigatório" }),
  apelido: z.string().min(3, { message: "Apelido obrigatório" }),
  phone: z.string().min(8, { message: "Número obrigatório" }),
  address: z.string().min(15, { message: "Morada obrigatória" }),
  email: z.string().email({ message: "Email inválido" }).optional().or(z.literal('')),
  obs: z.string().optional(), 
});

type FormValues = z.infer<typeof schema>;

const VendasForm = ({ 
  type, 
  tableLabel, 
  formId,
  eventId,
}: { 
  type: "create" | "edit"; 
  tableLabel: string;
  formId: string;
  eventId?: number;
}) => {
  const [isPending, startTransition] = useTransition();
  const [vendaStatus, setVendaStatus] = useState<VendaStatus>({
    tipo: 'Venda',
    modalidade: 'F2F',
    status: 'Projecto',
  });

  const [eventData, setEventData] = useState<FetchedEventData| null>(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(false);
  const [operators, setOperators] = useState<any[]>([]);
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('');
  const { user: currentUser } = useUser();

  const currentUserRole = currentUser?.publicMetadata?.role as string || 'N/A';
  const currentUserName = `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'N/A';
  const isAdmin = currentUserRole.toLowerCase() === 'admin';

  const handleSwitchValuesChange = useCallback((values: VendaStatus) => {
    setVendaStatus(values);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  // Fetch EVENT DATA for EDIT mode & OPERATORS for CREATE (admin only)
  useEffect(() => {
    if (type === "edit" && eventId) {
      const fetchEventData = async () => {
        setIsLoadingEvent(true);
        try {
          const data = await getEventById(eventId);
          if (!data) {
            throw new Error(`Evento não encontrado.`);
          }
          setEventData(data as FetchedEventData);

          setValue('name', data.client.frst_name);
          setValue('apelido', data.client.lst_name || '');
          setValue('email', data.client.email || '');
          setValue('phone', data.client.phone);
          setValue('address', data.client.address);
          setValue('obs', data.obs || '');

          const statusMap = {
            SALE: 'Venda' as const,
            CALLBACK: 'Callback' as const,
          };
          const channelMap = {
            REMOTE: 'Remoto' as const,
            F2F: 'F2F' as const,
          };
          const eventStatusMap = {
            PROJECT: 'Projecto' as const,
            CLOSED: 'Fechado' as const,
            LOST: 'Perdido' as const,
          };

          setVendaStatus({
            tipo: statusMap[data.type] || 'Venda',
            modalidade: channelMap[data.channel] || 'F2F',
            status: eventStatusMap[data.status] || 'Projecto',
          });

        } catch (error) {
          console.error("❌ Erro ao carregar evento:", error);
          toast.error("Erro ao carregar dados do evento");
          setEventData(null);
        } finally {
          setIsLoadingEvent(false);
        }
      };
      fetchEventData();
    }

    // Fetch operators for admin (CREATE mode only)
    if (type === "create" && isAdmin) {
      const fetchOperators = async () => {
        try {
          const data = await getOperatorsList();
          setOperators(data);
          // Set current user as default
          if (currentUser?.id) {
            setSelectedOperatorId(currentUser.id);
          }
        } catch (error) {
          console.error("Erro ao carregar operadores:", error);
        }
      };
      fetchOperators();
    }
  }, [type, eventId, setValue, isAdmin, currentUser]);

  const onSubmit = handleSubmit(async (formData) => {
    console.log("🚀 Form submitted:", formData);
    
    const tid = toast.loading(type === "create" ? "A criar venda..." : "A atualizar venda...");

    startTransition(async () => {
      try {
        const typeMap: Record<string, EventType> = {
          'Venda': 'SALE',
          'Callback': 'CALLBACK',
        };
        const channelMap: Record<string, EventChannel> = {
          'F2F': 'F2F',
          'Remoto': 'REMOTE',
        };
        const statusMap: Record<string, EventStatus> = {
          'Projecto': 'PROJECT',
          'Fechado': 'CLOSED',
          'Perdido': 'LOST',
        };

        let result;

        if (type === "create") {
          // Admin can select operator, others use self
          const operatorClerkId = isAdmin && selectedOperatorId 
            ? selectedOperatorId 
            : currentUser?.id;

          if (!operatorClerkId) {
            toast.error("Utilizador não autenticado", { id: tid });
            return;
          }

          console.log("📝 Creating event for Clerk userId:", operatorClerkId);

          result = await createEvent({
            clerkUserId: operatorClerkId,
            clientData: {
              frst_name: formData.name,
              lst_name: formData.apelido,
              phone: formData.phone,
              email: formData.email || undefined,
              address: formData.address,
            },
            type: typeMap[vendaStatus.tipo],
            channel: channelMap[vendaStatus.modalidade],
            status: statusMap[vendaStatus.status],
            obs: formData.obs,
          });

          console.log("✅ Create result:", result);
        } else {
          if (!eventId) {
            toast.error("ID do evento não fornecido", { id: tid });
            return;
          }

          console.log("📝 Updating event:", eventId);

          result = await updateEvent(eventId, {
            clientData: {
              frst_name: formData.name,
              lst_name: formData.apelido,
              phone: formData.phone,
              email: formData.email || undefined,
              address: formData.address,
            },
            type: typeMap[vendaStatus.tipo],
            channel: channelMap[vendaStatus.modalidade],
            status: statusMap[vendaStatus.status],
            obs: formData.obs,
          });

          console.log("✅ Update result:", result);
        }

        if (result?.error) {
          console.error("❌ Error:", result.error);
          toast.error(result.error, { id: tid });
        } else {
          toast.success(result?.message || "Operação concluída!", { id: tid });
          
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }

      } catch (error: any) {
        console.error('❌ Erro no submit:', error);
        toast.error(error?.message || 'Erro desconhecido', { id: tid });
      }
    });
  });

  const displayOperator = eventData?.operator || null;

  return (
    <form id={formId} className="w-full grid grid-cols-1 gap-6 lg:grid-cols-3" onSubmit={onSubmit}>
      {/* HEADER */}
      <div className="lg:col-span-3 flex justify-between items-center mb-2">
        <h1 className="text-xl font-semibold text-gray-800">
          {type === "create" ? "Criar" : "Editar"} {tableLabel}
        </h1>
        <div className="text-sm text-gray-600">
          <DateTime />
        </div>
      </div>

      {/* EVENT INFO (Edit Mode) */}
      {type === "edit" && (
        <div className="lg:col-span-3">
          <p className="text-xs text-gray-500 font-medium mb-1">Informação do Evento:</p>
          {isLoadingEvent ? (
            <p className="text-sm text-gray-500">A carregar...</p>
          ) : eventData ? (
            <div className="p-3 bg-gray-50 rounded-md space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs text-gray-500">Event ID:</span>
                  <span className="text-sm font-semibold text-gray-800 ml-2">#{eventData.eventId}</span>
                  <span className="text-xs text-gray-500 ml-2">({eventData.eventIdString})</span>
                </div>
                <span className="text-xs text-gray-500">
                  Criado: {new Date(eventData.createdAt).toLocaleString('pt-PT')}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-red-500">Erro ao carregar evento</p>
          )}
        </div>
      )}

      {/* OPERATOR INFO */}
      <div className="lg:col-span-3">
        <p className="text-xs text-gray-500 font-medium mb-1">Operador Responsável:</p>
        {type === "edit" && isLoadingEvent ? (
          <p className="text-sm text-gray-500">A carregar...</p>
        ) : displayOperator ? (
          <div className="p-3 bg-gray-50 rounded-md">
            <span className="text-sm font-semibold text-gray-800">
              {displayOperator.frst_name} {displayOperator.lst_name}
            </span>
            <span className="text-xs text-gray-500 ml-2">
              (ID: {displayOperator.internalId} - {displayOperator.role})
            </span>
          </div>
        ) : type === "create" && isAdmin && operators.length > 0 ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecionar Operador
            </label>
            <select
              value={selectedOperatorId}
              onChange={(e) => setSelectedOperatorId(e.target.value)}
              className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-800 bg-white"
            >
              <option value="">Selecione...</option>
              {operators.map((op) => (
                <option key={op.userId} value={op.userId}>
                  {op.frst_name} {op.lst_name} ({op.internalId})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-md">
            <span className="text-sm font-semibold text-gray-800">{currentUserName}</span>
            <span className="text-xs text-gray-500 ml-2 capitalize">({currentUserRole})</span>
          </div>
        )}
      </div>

      {/* SECTION: Event Type & Status */}
      <span className="text-xs text-gray-500 font-medium lg:col-span-3 mt-2 border-b border-gray-200 pb-1">
        Tipo de Evento e Status
      </span>

      <div className="lg:col-span-3">
        <VendasSwitches 
          onValuesChange={handleSwitchValuesChange}
          initialValues={vendaStatus} 
        />
      </div>

      {/* SECTION: Client Data */}
      <span className="text-xs text-gray-500 font-medium lg:col-span-3 mt-2 border-b border-gray-200 pb-1">
        Dados do Cliente
      </span>

      <InputField 
        label="Nome do Cliente" 
        name="name" 
        register={register} 
        error={errors.name} 
        inputProps={{ className: "text-sm px-2 text-gray-800" }} 
      />
      
      <InputField 
        label="Apelido do Cliente" 
        name="apelido" 
        register={register} 
        error={errors.apelido} 
        inputProps={{ className: "text-sm px-2 text-gray-800" }} 
      />

      <InputField 
        label="Telefone" 
        name="phone" 
        register={register} 
        error={errors.phone} 
        inputProps={{ 
          placeholder: "912345678",
          className: "text-sm px-2 text-gray-800"
        }} 
      />

      <InputField 
        label="Email (Opcional)" 
        name="email" 
        register={register} 
        error={errors.email} 
        inputProps={{ 
          type: "email",
          placeholder: "exemplo@email.com",
          className: "text-sm px-2 text-gray-800"
        }} 
      />

      <div className="lg:col-span-2">
        <InputField 
          label="Morada do Cliente" 
          name="address" 
          register={register} 
          error={errors.address} 
          inputProps={{ 
            placeholder: "Rua, Número, Código Postal, Cidade",
            className: "text-sm px-2 text-gray-800"
          }} 
        />
      </div>

      <div className="lg:col-span-3">
        <InputField 
          label="Observações" 
          name="obs" 
          register={register} 
          error={errors.obs} 
          isTextArea={true} 
          rows={3} 
          inputProps={{ className: "text-sm px-2 text-gray-800" }}
        />
      </div>

      {/* LOADING */}
      {isPending && (
        <div className="lg:col-span-3 text-center py-4">
          <p className="text-purple-600 font-semibold text-sm">A processar...</p>
        </div>
      )}
    </form>
  );
};

export default VendasForm;