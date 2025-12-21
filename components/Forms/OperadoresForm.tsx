"use client"

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import InputField from '../InputField';
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

// Schema with password for CREATE
const createSchema = z.object({
  email: z.string().email({ message: "Insira um email válido" }),
  name: z.string().min(3, { message: "Mínimo 3 caracteres" }),
  apelido: z.string().min(3, { message: "Mínimo 3 caracteres" }),
  phone: z.string().min(8, { message: "Número obrigatório" }),
  password: z.string().min(8, { message: "Mínimo 8 caracteres" }),
  role: z.enum(['OPERATOR', 'SUPERVISOR', 'D2D', 'ADMIN'], { message: "Escolha um role" }),
});

// Schema for EDIT (with optional password)
const editSchema = z.object({
  email: z.string().email({ message: "Insira um email válido" }),
  name: z.string().min(3, { message: "Mínimo 3 caracteres" }),
  apelido: z.string().min(3, { message: "Mínimo 3 caracteres" }),
  phone: z.string().min(8, { message: "Número obrigatório" }),
  password: z.string().min(8, { message: "Mínimo 8 caracteres" }).optional().or(z.literal('')), // ✅ Password opcional no edit
});

type CreateFormValues = z.infer<typeof createSchema>;
type EditFormValues = z.infer<typeof editSchema>;

type FetchedUserData = {
  id: number;
  userId: string; // ✅ Clerk ID
  email: string;
  frst_name: string;
  lst_name: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

const OperadoresForm = ({ 
  type, 
  data, 
  tableLabel, 
  formId,
  userId, // ✅ Este userId é o Clerk ID (string)
}: { 
  type: "create" | "edit"; 
  data?: unknown; 
  tableLabel: string;
  formId: string;
  userId?: string; // ✅ Mudado de number para string
}) => {
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState<FetchedUserData | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const { user: currentUser } = useUser();

  // ✅ DEBUG PROPS
  console.log('🎨 OperadoresForm props:', { type, userId, typeof_userId: typeof userId, formId });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateFormValues | EditFormValues>({
    resolver: zodResolver(type === "create" ? createSchema : editSchema),
  });

  // ✅ FETCH USER DATA (Edit Mode) - IGUAL AO VENDAS FORM
  useEffect(() => {
    if (type === "edit" && userId) {
      console.log('🔍 Iniciando fetch para userId:', userId, 'Type:', typeof userId);
      
      const fetchUserData = async () => {
        setIsLoadingUser(true);
        try {
          const response = await fetch(`/api/operators/${userId}`);
          
          console.log('📡 Response status:', response.status);
          
          if (!response.ok) {
            throw new Error(`Utilizador com ID ${userId} não encontrado.`);
          }
          
          const data: FetchedUserData = await response.json();
          console.log('✅ Dados recebidos:', data);
          
          setUserData(data);

          // ✅ PRE-FILL FORM FIELDS
          setValue('name', data.frst_name);
          setValue('apelido', data.lst_name);
          setValue('email', data.email);
          setValue('phone', data.phone || '');

          console.log('✅ Campos preenchidos:', {
            name: data.frst_name,
            apelido: data.lst_name,
            email: data.email,
            phone: data.phone,
          });

        } catch (error) {
          console.error("❌ Erro ao carregar utilizador:", error);
          setUserData(null);
        } finally {
          setIsLoadingUser(false);
        }
      };
      
      fetchUserData();
    } else if (type === "edit" && !userId) {
      console.error('❌ ERRO CRÍTICO: userId é undefined em modo edit!');
      console.error('Props recebidas:', { type, userId, formId });
    }
  }, [type, userId, setValue]);

  const onSubmit = handleSubmit(async (formData) => {
    console.log('📤 Submitting form:', { type, userId, formData });
    setIsSubmitting(true);
    
    try {
      let response;
      let endpoint = '';

      if (type === "create") {
        endpoint = '/api/users';
        console.log('➕ Creating new user...');
        console.log('📍 Endpoint:', endpoint);
        console.log('📦 Payload:', formData);
        
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        endpoint = `/api/operators/${userId}`;
        console.log('✏️ Updating user:', userId);
        console.log('📍 Endpoint:', endpoint);
        
        // ✅ Só envia password se foi preenchida
        const updateData: any = {
          name: formData.name,
          apelido: formData.apelido,
          email: formData.email,
          phone: formData.phone,
        };
        
        if (formData.password && formData.password.trim() !== '') {
          updateData.password = formData.password;
          console.log('🔑 Password será atualizada');
        }
        
        console.log('📦 Payload:', updateData);
        
        response = await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });
      }

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      // ✅ Verifica se é JSON antes de parsear
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('❌ Response não é JSON:', textResponse.substring(0, 200));
        throw new Error('Servidor retornou HTML em vez de JSON. Verifica os logs do terminal.');
      }

      const result = await response.json();
      console.log('📥 Response JSON:', result);

      if (!response.ok) {
        throw new Error(result?.error || `Erro ${response.status}: ${response.statusText}`);
      }

      console.log('✅ Sucesso:', result);
      alert(`${type === "create" ? "Criado" : "Atualizado"} com sucesso!`);
      window.location.reload();

    } catch (error) {
      console.error('❌ Erro no submit:', error);
      console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'N/A');
      alert(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  });

  // Get creator name
  const creatorName = currentUser 
    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() 
    : 'Admin';

  return (
    <form id={formId} className="w-full grid grid-cols-1 gap-8 lg:grid-cols-3" onSubmit={onSubmit}>
      
      {/* ERROR ALERT - userId undefined */}
      {type === "edit" && !userId && (
        <div className="lg:col-span-3 p-4 bg-red-100 border border-red-400 rounded-md">
          <p className="text-red-800 font-bold">⚠️ ERRO: userId não foi passado para o formulário!</p>
          <p className="text-red-600 text-sm mt-2">O FormModal não está a passar o userId corretamente.</p>
        </div>
      )}

      {/* HEADER */}
      <div className="lg:col-span-3 flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-gray-800">
          {type === "create" ? "Criar novo" : "Editar"} {tableLabel}
        </h1>
        <div className="text-sm text-gray-600">
          Criado por: <span className="font-semibold text-purple-600">{creatorName || 'Carregando...'}</span>
        </div>
      </div>

      {/* USER ID SECTION (Edit Mode Only) */}
      {type === "edit" && (
        <div className="lg:col-span-3">
          <p className="text-xs text-gray-500 font-medium mb-1">Informação do Utilizador:</p>
          {isLoadingUser ? (
            <p className="text-sm text-gray-500">A carregar...</p>
          ) : userData ? (
            <div className="p-3 bg-gray-50 rounded-md space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs text-gray-500">DB ID:</span>
                  <span className="text-sm font-semibold text-black ml-2">#{userData.id}</span>
                </div>
                <span className="text-xs text-gray-500">
                  Criado: {new Date(userData.created_at).toLocaleString('pt-PT')}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-xs text-gray-500">Clerk ID:</span>
                  <p className="text-black font-mono text-xs">{userData.userId}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Email:</span>
                  <p className="text-black">{userData.email}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Telefone:</span>
                  <p className="text-black">{userData.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-red-500">Erro ao carregar utilizador</p>
          )}
        </div>
      )}

      {/* CURRENT ROLE SECTION (Edit Mode) */}
      {type === "edit" && userData && (
        <div className="lg:col-span-3">
          <p className="text-xs text-gray-500 font-medium mb-1">Role Atual:</p>
          <div className="p-3 bg-gray-50 rounded-md flex items-center gap-3">
            <span className="text-sm font-semibold text-black">{userData.role}</span>
            <span className={`text-xs px-2 py-1 rounded ${userData.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {userData.is_active ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </div>
      )}
      
      <span className="text-xs text-gray-500 font-medium lg:col-span-3 mt-4">
        Informação Pessoal
      </span>

      {/* FORM FIELDS */}
      <InputField 
        label="Nome" 
        name="name" 
        register={register} 
        error={errors.name} 
        inputProps={{}} 
      />
      <InputField 
        label="Apelido" 
        name="apelido" 
        register={register} 
        error={errors.apelido} 
        inputProps={{}} 
      />
      <InputField 
        label="Email" 
        name="email" 
        register={register} 
        error={errors.email} 
        inputProps={{ type: "email" }} 
      />
      <InputField 
        label="Telefone" 
        name="phone" 
        register={register} 
        error={errors.phone} 
        inputProps={{}} 
      />

      {/* PASSWORD FIELD - CREATE AND EDIT */}
      <InputField 
        label={type === "create" ? "Password" : "Nova Password (opcional)"}
        name="password" 
        register={register} 
        error={errors.password} 
        inputProps={{ 
          type: "password",
          placeholder: type === "edit" ? "Deixe vazio para manter a atual" : ""
        }} 
      />

      {/* ROLE SELECTION - CREATE ONLY */}
      {type === "create" && (
        <div className="lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Utilizador
          </label>
          <select
            {...register('role')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-black bg-white"
          >
            <option value="">Selecione...</option>
            <option value="OPERATOR">Operador</option>
            <option value="SUPERVISOR">Supervisor</option>
            <option value="D2D">Vendedor (D2D)</option>
            <option value="ADMIN">Administrador</option>
          </select>
          {errors.role && (
            <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>
          )}
        </div>
      )}

      {/* DEBUG DISPLAY (Edit Mode) */}
      {type === "edit" && userData && (
        <div className="lg:col-span-3 p-3 bg-blue-50 rounded-md text-sm space-y-2">
          <p className="font-bold text-black mb-2">🔍 Debug - Dados do Fetch:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-600">DB ID:</span>
              <span className="text-black font-semibold ml-2">{userData.id}</span>
            </div>
            <div>
              <span className="text-gray-600">Clerk ID:</span>
              <span className="text-black font-semibold ml-2">{userData.userId}</span>
            </div>
            <div>
              <span className="text-gray-600">Nome:</span>
              <span className="text-black font-semibold ml-2">{userData.frst_name}</span>
            </div>
            <div>
              <span className="text-gray-600">Apelido:</span>
              <span className="text-black font-semibold ml-2">{userData.lst_name}</span>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <span className="text-black font-semibold ml-2">{userData.email}</span>
            </div>
            <div>
              <span className="text-gray-600">Telefone:</span>
              <span className="text-black font-semibold ml-2">{userData.phone || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-600">Role:</span>
              <span className="text-black font-semibold ml-2">{userData.role}</span>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <span className={`font-semibold ml-2 ${userData.is_active ? 'text-green-600' : 'text-red-600'}`}>
                {userData.is_active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* LOADING INDICATOR */}
      {isSubmitting && (
        <div className="lg:col-span-3 text-center">
          <p className="text-purple-600 font-semibold">A guardar...</p>
        </div>
      )}
    </form>
  );
};

export default OperadoresForm;