"use client"

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState, useEffect, useCallback } from 'react'; 
import InputField from '../InputField';  
import DateTime from '../DateTime';
import VendasSwitches, { VendaStatus } from '../VendasSwitches'; 

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

const EVENT_OPTIONS = ["Venda", "Callback"]; 

// --- ZOD SCHEMA ---
const schema = z.object({
  event: z.enum(EVENT_OPTIONS as [string, ...string[]], { message: "Escolhe o evento" }).optional(), 
  name: z.string().min(3, { message: "O nome do Cliente é obrigatório" }),
  apelido: z.string().min(3, { message: "O apelido do Cliente é obrigatório" }),
  phone: z.string().min(8, { message: "Número do Cliente é obrigatório" }),
  address: z.string().min(15, { message: "A morada do Cliente é obrigatória" }),
  email: z.string().email({ message: "Insira um email válido" }).optional().or(z.literal('')),
  genero: z.enum(["Masculino", "Feminino", "Prefiro não especificar"], { message: "Escolhe uma opção" }),
  obs: z.string().optional(), 
});

type FormValues = z.infer<typeof schema>;

// --- COMPONENT ---
const VendasForm = ({ 
  type, 
  data, 
  tableLabel, 
  formId,
  eventId, // NEW: Event ID for edit mode
  operatorId = 1, // Fallback for create mode
}: { 
  type: "create" | "edit"; 
  data?: unknown; 
  tableLabel: string;
  formId: string;
  eventId?: number; // Optional, only for edit
  operatorId?: number;
}) => {

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

  // FETCH OPERATOR DATA (Create Mode)
  const [operatorDetails, setOperatorDetails] = useState<FetchedOperator | null>(null);

  useEffect(() => {
    if (type === "create" && operatorId) {
      const fetchOperator = async () => {
        try {
          const response = await fetch(`/api/operators/${operatorId}`);
          if (!response.ok) throw new Error('Operator not found');
          const data = await response.json();
          setOperatorDetails({
            id: operatorId,
            frst_name: data.frst_name,
            lst_name: data.lst_name,
            role: data.role,
          });
        } catch (error) {
          console.error("Erro ao carregar operador:", error);
        }
      };
      fetchOperator();
    }
  }, [type, operatorId]);

  // FETCH EVENT DATA (Edit Mode)
  useEffect(() => {
    if (type === "edit" && eventId) {
      const fetchEventData = async () => {
        setIsLoadingEvent(true);
        try {
          const response = await fetch(`/api/events/${eventId}`);
          
          if (!response.ok) {
            throw new Error(`Evento com ID ${eventId} não encontrado.`);
          }
          
          const data: FetchedEventData = await response.json();
          setEventData(data);
          setOperatorDetails(data.operator); // ✅ Also set operator from event

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
          setEventData(null);
        } finally {
          setIsLoadingEvent(false);
        }
      };
      
      fetchEventData();
    }
  }, [type, eventId, setValue]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = handleSubmit(async (formData) => {
    setIsSubmitting(true);
    
    try {
      const payload = {
        name: formData.name,
        apelido: formData.apelido,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        obs: formData.obs,
        vendaStatus: vendaStatus,
      };

      let response;
      
      if (type === "create") {
        // CREATE
        response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // UPDATE
        response = await fetch(`/api/events/${eventId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao salvar');
      }

      console.log('✅ Sucesso:', result);
      alert(`${type === "create" ? "Criado" : "Atualizado"} com sucesso!`);
      
      // Reload page to see changes
      window.location.reload();

    } catch (error) {
      console.error('❌ Erro:', error);
      alert(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  });

  // Get operator info
  const currentOperator = operatorDetails;
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

      {/* EVENT ID SECTION (Edit Mode Only) */}
      {type === "edit" && (
        <div className="lg:col-span-3">
          <p className="text-xs text-gray-500 font-medium mb-1">ID do Evento:</p>
          {isLoadingEvent ? (
            <p className="text-sm text-gray-500">A carregar...</p>
          ) : eventData ? (
            <div className="p-2 bg-gray-50 rounded-md flex justify-between items-center">
              <div>
                <span className="text-sm font-semibold text-black">
                  #{eventData.eventId}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  ({eventData.eventIdString})
                </span>
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

      {/* OPERATOR SECTION */}
      <div className="lg:col-span-3">
        <p className="text-xs text-gray-500 font-medium mb-1">Operador Responsável:</p>
        {currentOperator ? (
          <div className="p-2 bg-gray-50 rounded-md">
            <span className="text-sm font-semibold text-black"> 
              {currentOperator.frst_name} {currentOperator.lst_name} 
            </span>
            <span className="text-xs text-gray-500"> (ID: {currentOperator.id} - {currentOperator.role})</span>
          </div>
        ) : (
          <p className="text-sm text-gray-500">A carregar operador...</p>
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

      {/* Submit button moved to FormModal */}
      {isSubmitting && (
        <div className="lg:col-span-3 text-center">
          <p className="text-purple-600 font-semibold">A guardar...</p>
        </div>
      )}
    </form>
  );
};

export default VendasForm;