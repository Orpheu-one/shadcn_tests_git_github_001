"use client"

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState, useEffect, useCallback, useTransition } from 'react'; 
import { useRouter } from 'next/navigation';
import InputField from '../InputField'; 
import DateTime from '../DateTime';
import VendasSwitches, { VendaStatus } from '../VendasSwitches';
import { createEvent, updateEvent, getEventById, getOperatorsList } from '@/lib/actions/user.actions';
import { toast } from 'sonner';
import { EventType, EventChannel, EventStatus } from '@prisma/client';
import { useUser } from '@clerk/nextjs';

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
  type: EventType;
  channel: EventChannel;
  status: EventStatus;
  obs: string | null;
  calledback_at: Date | null;
  operator: FetchedOperator;
  client: {
    frst_name: string;
    lst_name: string | null;
    email: string | null;
    phone: string;
    address: string;
  };
}

// SCHEMA ATUALIZADO COM VALIDAÇÃO DE DATA
const schema = z.object({
  name: z.string().min(3, { message: "Nome obrigatório" }),
  apelido: z.string().min(3, { message: "Apelido obrigatório" }),
  phone: z.string().min(8, { message: "Número obrigatório" }),
  address: z.string().min(15, { message: "Morada obrigatória" }),
  email: z.string().email({ message: "Email inválido" }).optional().or(z.literal('')),
  obs: z.string().optional(),
  calledback_at: z.date().refine((date) => date > new Date(), {
    message: "Escolha uma data posterior à actual",
  }).optional(),
});

type FormValues = z.infer<typeof schema>;

const VendasForm = ({ 
  type, 
  tableLabel, 
  formId,
  eventId,
  onSuccess,
}: { 
  type: "create" | "edit"; 
  tableLabel: string; 
  formId: string;
  eventId?: number;
  onSuccess?: () => void;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vendaStatus, setVendaStatus] = useState<VendaStatus>({
    tipo: 'Venda',
    modalidade: 'F2F',
    status: 'Projecto',
  });

  const [eventData, setEventData] = useState<FetchedEventData | null>(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(false);
  const [operators, setOperators] = useState<any[]>([]);
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('');
  const { user: currentUser } = useUser();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      calledback_at: new Date(new Date().getTime() + 60000) // Default: Agora + 1 min
    }
  });

  const selectedDate = watch("calledback_at");

  const isAdmin = (currentUser?.publicMetadata?.role as string)?.toLowerCase() === 'admin';
  const currentUserRole = (currentUser?.publicMetadata?.role as string)?.toLowerCase() || 'operator';
  const currentUserName = `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'N/A';

  const handleSwitchValuesChange = useCallback((values: VendaStatus) => {
    setVendaStatus(values);
  }, []);

  const handleDateChange = useCallback((date: Date) => {
    setValue('calledback_at', date, { shouldValidate: true });
  }, [setValue]);

  // MAPAS DE CONVERSÃO
  const typeMap: Record<string, EventType> = { 'Venda': 'SALE', 'Callback': 'CALLBACK' };
  const channelMap: Record<string, EventChannel> = { 'F2F': 'F2F', 'Remoto': 'REMOTE' };
  const statusMap: Record<string, EventStatus> = { 
    'Projecto': 'PROJECT', 
    'Fechada': 'CLOSED', 
    'Perdida': 'LOST' 
  };

  useEffect(() => {
    if (type === "edit" && eventId) {
      const fetchEventData = async () => {
        setIsLoadingEvent(true);
        try {
          const data = await getEventById(eventId);
          if (!data) throw new Error(`Evento não encontrado.`);
          const typedData = data as FetchedEventData;
          setEventData(typedData);
          setValue('name', typedData.client.frst_name);
          setValue('apelido', typedData.client.lst_name || '');
          setValue('email', typedData.client.email || '');
          setValue('phone', typedData.client.phone);
          setValue('address', typedData.client.address);
          setValue('obs', typedData.obs || '');
          if(typedData.calledback_at) setValue('calledback_at', new Date(typedData.calledback_at));

          const revType = typedData.type === 'SALE' ? 'Venda' : 'Callback';
          const revChan = typedData.channel === 'REMOTE' ? 'Remoto' : 'F2F';
          const revStat = typedData.status === 'PROJECT' ? 'Projecto' : typedData.status === 'CLOSED' ? 'Fechada' : 'Perdida';
          setVendaStatus({ tipo: revType, modalidade: revChan, status: revStat });
        } catch (error) {
          toast.error("Erro ao carregar evento");
        } finally {
          setIsLoadingEvent(false);
        }
      };
      fetchEventData();
    }
    if (type === "create" && isAdmin) {
      getOperatorsList().then(setOperators).catch(console.error);
    }
  }, [type, eventId, setValue, isAdmin]);

  const onSubmit = handleSubmit(async (formData) => {
    const tid = toast.loading(type === "create" ? "A criar..." : "A atualizar...");
    setIsSubmitting(true);

    startTransition(async () => {
      try {
        const rawType = typeMap[vendaStatus.tipo];
        const rawChannel = channelMap[vendaStatus.modalidade];
        let finalStatus = statusMap[vendaStatus.status];

        if (rawType === 'CALLBACK') {
          finalStatus = 'PROJECT';
        }

        const payload = {
          clientData: {
            frst_name: formData.name,
            lst_name: formData.apelido,
            phone: formData.phone,
            email: formData.email || undefined,
            address: formData.address,
          },
          type: rawType,
          channel: rawChannel,
          status: finalStatus,
          obs: formData.obs,
          calledback_at: rawType === 'CALLBACK' ? formData.calledback_at : null,
        };

        let result;
        if (type === "create") {
          const opId = isAdmin && selectedOperatorId ? selectedOperatorId : currentUser?.id;
          if (!opId) throw new Error("Não autenticado");
          result = await createEvent({ ...payload, clerkUserId: opId });
        } else {
          if (!eventId) throw new Error("ID em falta");
          result = await updateEvent(Number(eventId), payload);
        }

        if (result?.error) throw new Error(result.error);
        toast.success("Operação concluída!", { id: tid });
        if (onSuccess) onSuccess();
        router.push('/lists/vendas');
        router.refresh();
      } catch (error: any) {
        setIsSubmitting(false);
        toast.error(error.message || "Erro na submissão", { id: tid });
      }
    });
  });

  if (isSubmitting) {
    return (
      <div className="w-full grid grid-cols-1 gap-6 lg:grid-cols-3 relative min-h-[400px]">
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">A processar...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form id={formId} className="w-full grid grid-cols-1 gap-6 lg:grid-cols-3" onSubmit={onSubmit}>
      <div className="lg:col-span-3 flex justify-between items-center mb-2">
        <h1 className="text-xl font-semibold text-gray-800">{type === "create" ? "Criar" : "Editar"} {tableLabel}</h1>
        <div className="text-sm text-gray-600"><DateTime /></div>
      </div>

      <div className="lg:col-span-3">
        <p className="text-xs text-gray-500 font-medium mb-1">Operador:</p>
        {type === "edit" ? (
          eventData?.operator && (
            <div className="p-3 bg-gray-50 rounded-md text-black">
              <span className="text-sm font-semibold">{eventData.operator.frst_name} {eventData.operator.lst_name}</span>
            </div>
          )
        ) : isAdmin ? (
          <select value={selectedOperatorId} onChange={(e) => setSelectedOperatorId(e.target.value)} className="w-full p-2 border rounded-md text-sm bg-white text-black">
            <option value="">Selecione...</option>
            {operators.map((op) => (
              <option key={op.userId} value={op.userId}>{op.frst_name} ({op.internalId})</option>
            ))}
          </select>
        ) : (
          <div className="p-3 bg-gray-50 rounded-md text-black"><span className="text-sm font-semibold">{currentUserName}</span></div>
        )}
      </div>

      <div className="lg:col-span-3">
        <VendasSwitches 
          onValuesChange={handleSwitchValuesChange} 
          initialValues={vendaStatus}
          userRole={currentUserRole}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          dateError={errors.calledback_at?.message}
        />
      </div>

      <InputField label="Nome" name="name" register={register} error={errors.name} inputProps={{ className: "text-sm px-2 text-black" }} />
      <InputField label="Apelido" name="apelido" register={register} error={errors.apelido} inputProps={{ className: "text-sm px-2 text-black" }} />
      <InputField label="Telefone" name="phone" register={register} error={errors.phone} inputProps={{ className: "text-sm px-2 text-black" }} />
      <InputField label="Email" name="email" register={register} error={errors.email} inputProps={{ type: "email", className: "text-sm px-2 text-black" }} />
      <div className="lg:col-span-2">
        <InputField label="Morada" name="address" register={register} error={errors.address} inputProps={{ className: "text-sm px-2 text-black" }} />
      </div>

      <div className="lg:col-span-3">
        <InputField label="Observações" name="obs" register={register} error={errors.obs} isTextArea rows={3} inputProps={{ className: "text-sm px-2 text-black" }} />
      </div>
    </form>
  );
};

export default VendasForm;