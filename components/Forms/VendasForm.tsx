"use client"

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState, useEffect, useCallback, useTransition } from 'react'; 
import InputField from '../InputField';  
import DateTime from '../DateTime';
import VendasSwitches, { VendaStatus } from '../VendasSwitches';
import { createEvent, updateEvent, getEventById } from '@/lib/actions/user.actions';
import { toast } from 'sonner';
import { EventType, EventChannel, EventStatus } from '@prisma/client';

// --- TYPES ---
type FetchedOperator = {
  id: number;
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
  name: z.string().min(3, { message: "O nome do Cliente é obrigatório" }),
  apelido: z.string().min(3, { message: "O apelido do Cliente é obrigatório" }),
  phone: z.string().min(8, { message: "Número do Cliente é obrigatório" }),
  address: z.string().min(15, { message: "A morada do Cliente é obrigatória" }),
  email: z.string().email({ message: "Insira um email válido" }).optional().or(z.literal('')),
  genero: z.enum(["Masculino", "Feminino", "Prefiro não especificar"], { message: "Escolhe uma opção" }),
  obs: z.string().optional(), 
});

type FormValues = z.infer<typeof schema>;

const VendasForm = ({ 
  type, 
  data, 
  tableLabel, 
  formId,
  eventId,
  operatorId = 1,
}: { 
  type: "create" | "edit"; 
  data?: unknown; 
  tableLabel: string;
  formId: string;
  eventId?: number;
  operatorId?: number;
}) => {

  const [isPending, startTransition] = useTransition();
  const [vendaStatus, setVendaStatus] = useState<VendaStatus>({
    tipo: 'Venda',
    modalidade: 'F2F',
    status: 'Projecto',
  });

  const [eventData, setEventData] = useState<FetchedEventData | null>(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(false);

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

  // ✅ FETCH EVENT DATA usando Server Action (Edit Mode)
  useEffect(() => {
    if (type === "edit" && eventId) {
      const fetchEventData = async () => {
        setIsLoadingEvent(true);
        try {
          const data = await getEventById(eventId);
          
          if (!data) {
            throw new Error(`Evento com ID ${eventId} não encontrado.`);
          }
          
          setEventData(data as FetchedEventData);

          // Pre-fill form fields
          setValue('name', data.client.frst_name);
          setValue('apelido', data.client.lst_name || '');
          setValue('email', data.client.email || '');
          setValue('phone', data.client.phone);
          setValue('address', data.client.address);
          setValue('obs', data.obs || '');

          // Pre-select switches
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
          console.error("Erro ao carregar evento:", error);
          toast.error("Erro ao carregar dados do evento");
          setEventData(null);
        } finally {
          setIsLoadingEvent(false);
        }
      };
      
      fetchEventData();
    }
  }, [type, eventId, setValue]);

  const onSubmit = handleSubmit(async (formData) => {
    startTransition(async () => {
      try {
        // Map venda status to Prisma enums
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
          // ✅ CREATE usando Server Action
          result = await createEvent({
            userId: operatorId,
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
        } else {
          // ✅ UPDATE usando Server Action
          if (!eventId) {
            toast.error("ID do evento não fornecido");
            return;
          }

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
        }

        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success(result?.message || `${type === "create" ? "Criada" : "Atualizada"} com sucesso!`);
          window.location.reload();
        }

      } catch (error) {
        console.error('❌ Erro no submit:', error);
        toast.error('Erro desconhecido');
      }
    });
  });

  const currentOperator = eventData?.operator || null;
  const displayOperatorId = currentOperator?.id || operatorId;

  return (
    <form id={formId} className="w-full grid grid-cols-1 gap-8 lg:grid-cols-3" onSubmit={onSubmit}>
      
      <div className="lg:col-span-3 flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-gray-800">
          {type === "create" ? "Criar" : "Editar"} {tableLabel}
        </h1>
        <div className="text-sm text-gray-600">
          <DateTime />
        </div>
      </div>

      {/* EVENT ID (Edit Mode) */}
      {type === "edit" && (
        <div className="lg:col-span-3">
          <p className="text-xs text-gray-500 font-medium mb-1">ID do Evento:</p>
          {isLoadingEvent ? (
            <p className="text-sm text-gray-500">A carregar...</p>
          ) : eventData ? (
            <div className="p-2 bg-gray-50 rounded-md flex justify-between items-center">
              <div>
                <span className="text-sm font-semibold text-black">#{eventData.eventId}</span>
                <span className="text-xs text-gray-500 ml-2">({eventData.eventIdString})</span>
              </div>
              <span className="text-xs text-gray-500">
                Criado: {new Date(eventData.createdAt).toLocaleString('pt-PT')}
              </span>
            </div>
          ) : (
            <p className="text-sm text-red-500">Erro ao carregar evento</p>
          )}
        </div>
      )}

      {/* OPERATOR */}
      <div className="lg:col-span-3">
        <p className="text-xs text-gray-500 font-medium mb-1">Operador Responsável:</p>
        {isLoadingEvent && type === "edit" ? (
          <p className="text-sm text-gray-500">A carregar...</p>
        ) : currentOperator ? (
          <div className="p-2 bg-gray-50 rounded-md">
            <span className="text-sm font-semibold text-black"> 
              {currentOperator.frst_name} {currentOperator.lst_name} 
            </span>
            <span className="text-xs text-gray-500"> (ID: {currentOperator.id} - {currentOperator.role})</span>
          </div>
        ) : (
          <p className="text-sm text-red-500">ID: {displayOperatorId} (Criar modo)</p>
        )}
      </div>

      <span className="text-xs text-gray-500 font-medium lg:col-span-3 mt-4">Tipo de Evento e Status</span>
      <div className="lg:col-span-3">
        <VendasSwitches 
          onValuesChange={handleSwitchValuesChange}
          initialValues={vendaStatus} 
        />
        
        {/* Debug Display */}
        <div className="mt-4 p-3 bg-gray-200 rounded-md text-sm text-black">
          <p className="font-bold">Status Atual da Venda:</p>
          <p>- Tipo: <span className="text-xs text-gray-800">{vendaStatus.tipo}</span></p>
          <p>- Modalidade: <span className="text-xs text-gray-800">{vendaStatus.modalidade}</span></p>
          <p>- Status Final: <span className="text-xs text-gray-800">{vendaStatus.status}</span></p>
        </div>
      </div> 
      
      <span className="text-xs text-gray-500 font-medium lg:col-span-3 mt-4">Dados do Cliente (Obrigatório)</span>
      
      <InputField label="Nome do Cliente" name="name" register={register} error={errors.name} inputProps={{}} />
      <InputField label="Apelido do Cliente" name="apelido" register={register} error={errors.apelido} inputProps={{}} />
      <InputField label="Email do Cliente" name="email" register={register} error={errors.email} inputProps={{ type: "email" }} />
      <InputField label="Número de Telefone" name="phone" register={register} error={errors.phone} inputProps={{}} />
      <InputField label="Morada do Cliente" name="address" register={register} error={errors.address} inputProps={{}} />
      <InputField label="Género" name="genero" register={register} error={errors.genero} inputProps={{ placeholder: "Masculino / Feminino" }} />

      <div className="lg:col-span-3">
        <InputField 
          label="Observações" 
          name="obs" 
          register={register} 
          error={errors.obs} 
          isTextArea={true} 
          rows={3}          
          inputProps={{}}
        />
      </div>

      {/* LOADING */}
      {isPending && (
        <div className="lg:col-span-3 text-center">
          <p className="text-purple-600 font-semibold">A guardar...</p>
        </div>
      )}
    </form>
  );
};

export default VendasForm;