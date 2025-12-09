"use client"

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// Importação de useCallback para otimizar a função de callback
import React, { useState, useEffect, useCallback } from 'react'; 
import InputField from '../InputField'; 
import RadioButton from '../RadioButton'; 
import DateTime from '../DateTime';
// IMPORTAÇÃO CRÍTICA: Componente agrupador de lógica E o tipo VendaStatus
// Assumindo que VendasSwitches.tsx está no mesmo diretório (./)
import VendasSwitches, { VendaStatus } from '../VendasSwitches'; 

// --- TIPAGEM ---
// Estrutura de dados devolvida pela API Route do Operador
type FetchedOperator = {
    frst_name: string;
    lst_name: string;
    role: string;
}

const EVENT_OPTIONS = ["Venda", "Callback"]; 

// --- SCHEMA ZOD ---
const schema = z.object({
  // 'event' tornado opcional
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

// --- COMPONENTE ---
const VendasForm = ({ 
  type, 
  data, 
  tableLabel, 
  formId,
  // SIMULAÇÃO: ID 1 fixo para teste da ligação ao backend
  operatorId = 1, 
}: { 
  type: "create" | "edit"; 
  data?: unknown; 
  tableLabel: string;
  formId: string;
  operatorId?: number;
}) => {

  // NOVO ESTADO: Para guardar os valores dos switches (usando o tipo VendaStatus)
  const [vendaStatus, setVendaStatus] = useState<VendaStatus>({
    tipo: 'Venda',
    modalidade: 'F2F',
    status: 'Projecto',
  });

  // NOVA FUNÇÃO: Callback para receber os valores atualizados do VendasSwitches
  const handleSwitchValuesChange = useCallback((values: VendaStatus) => {
    setVendaStatus(values);
  }, []);
    
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit((data) => {
    // ALTERAÇÃO: Inclui os valores detalhados dos switches no objeto de submissão
    console.log("Vendas Submit (Dados do Cliente + Operador ID + Status Venda):", {
        ...data,
        userId: operatorId,
        vendaStatus: vendaStatus, // Dados dos switches
    });
  });

  const [operatorDetails, setOperatorDetails] = useState<FetchedOperator | null>(null);

  // LÓGICA DE FETCH: Pede o nome do operador à API Route
  useEffect(() => {
    const fetchOperatorData = async () => {
      if (!operatorId || operatorId === 0) return; 

      try {
        // CHAMADA À API ROUTE: /api/operators/[id]
        const response = await fetch(`/api/operators/${operatorId}`); 
        
        if (!response.ok) {
            throw new Error(`Operador com ID ${operatorId} não encontrado.`);
        }
        
        const userData: FetchedOperator = await response.json();
        setOperatorDetails(userData);

      } catch (error) {
        console.error("Erro no fetch de Operador (Verifica a API Route):", error);
        setOperatorDetails(null);
      }
    };
    
    fetchOperatorData();
  }, [operatorId]); 


  return (
    <form id={formId} className="w-full grid grid-cols-1 gap-8 lg:grid-cols-3" onSubmit={onSubmit}>
      
      <div className="lg:col-span-3 flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-gray-800">
          {type === "create" ? "Criar" : "Editar"} {tableLabel}
        </h1>
        <div className="text-sm text-gray-600">
             <DateTime/>
        </div>
      </div>

      {/* SECÇÃO DO OPERADOR RESPONSÁVEL */}
      <div className="lg:col-span-3">
          <p className="text-xs text-gray-500 font-medium mb-1">Operador Responsável:</p>
          {operatorDetails ? (
              <div className="p-2 bg-gray-50 rounded-md">
                  <span className="text-sm font-semibold text-black"> 
                      {operatorDetails.frst_name} {operatorDetails.lst_name} 
                  </span>
                  <span className="text-xs text-gray-500"> ({operatorDetails.role})</span>
              </div>
          ) : (
              <p className="text-sm text-red-500">
                  A carregar detalhes do operador (ID: {operatorId}) ou erro no fetch.
              </p>
          )}
      </div>

      <span className="text-xs text-gray-500 font-medium lg:col-span-3 mt-4">Tipo de Evento e Status</span>
      <div className="lg:col-span-3">
        {/* COMPONENTE INTEGRADO: VendasSwitches */}
        <VendasSwitches onValuesChange={handleSwitchValuesChange} />
        
        {/* Debug: Mostra os valores apanhados do VendasSwitches */}
        <div className="mt-4 p-3 bg-gray-200 rounded-md text-sm text-black">
            <p className="font-bold">Status Atual da Venda:</p>
            <p>- Tipo: <span className="text-xs text-gray-800">{vendaStatus.tipo}</span></p>
            <p>- Modalidade: <span className="text-xs text-gray-800">{vendaStatus.modalidade}</span></p>
            <p>- Status Final: <span className="text-xs text-gray-800">{vendaStatus.status}</span></p>
          </div>
      </div> 
      
      <span className="text-xs text-gray-500 font-medium lg:col-span-3 mt-4">Dados do Cliente (Obrigatório)</span>
      
      {/* CAMPOS DE INPUT NORMAIS */}
      <InputField label="Nome do Cliente" name="name" register={register} error={errors.name} inputProps={{}} />
      <InputField label="Apelido do Cliente" name="apelido" register={register} error={errors.apelido} inputProps={{}} />
      <InputField label="Email do Cliente" name="email" register={register} error={errors.email} inputProps={{ type: "email" }} />
      <InputField label="Número de Telefone" name="phone" register={register} error={errors.phone} inputProps={{}} />
      <InputField label="Morada do Cliente" name="address" register={register} error={errors.address} inputProps={{}} />
      <InputField label="Género" name="genero" register={register} error={errors.genero} inputProps={{ placeholder: "Masculino / Feminino" }} />

      {/* CAMPO OBSERVAÇÕES (TextArea) */}
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
 
    </form>
  );
};

export default VendasForm;