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

// Schema for EDIT (no password, no role change)
const editSchema = z.object({
  email: z.string().email({ message: "Insira um email válido" }),
  name: z.string().min(3, { message: "Mínimo 3 caracteres" }),
  apelido: z.string().min(3, { message: "Mínimo 3 caracteres" }),
  phone: z.string().min(8, { message: "Número obrigatório" }),
});

type CreateFormValues = z.infer<typeof createSchema>;
type EditFormValues = z.infer<typeof editSchema>;

type FetchedUserData = {
  id: number;
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
  userId, // ✅ Recebe userId do FormModal
}: { 
  type: "create" | "edit"; 
  data?: unknown; 
  tableLabel: string;
  formId: string;
  userId?: number;
}) => {
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState<FetchedUserData | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false); // ✅ Loading state
  const { user: currentUser } = useUser(); // Get logged-in user (creator)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateFormValues | EditFormValues>({
    resolver: zodResolver(type === "create" ? createSchema : editSchema),
  });

  // ✅ Fetch user data for edit mode (seguindo o padrão do VendasForm)
  useEffect(() => {
    if (type === "edit" && userId) {
      const fetchUser = async () => {
        setIsLoadingUser(true);
        try {
          const response = await fetch(`/api/operators/${userId}`);
          
          if (!response.ok) {
            throw new Error(`Utilizador com ID ${userId} não encontrado.`);
          }
          
          const data: FetchedUserData = await response.json();
          setUserData(data);

          // ✅ Pre-fill form fields
          setValue('name', data.frst_name);
          setValue('apelido', data.lst_name);
          setValue('email', data.email);
          setValue('phone', data.phone || '');

          console.log('✅ Dados carregados:', data);

        } catch (error) {
          console.error("❌ Erro ao carregar utilizador:", error);
          setUserData(null);
        } finally {
          setIsLoadingUser(false);
        }
      };
      
      fetchUser();
    }
  }, [type, userId, setValue]);

  const onSubmit = handleSubmit(async (formData) => {
    setIsSubmitting(true);
    
    try {
      let response;

      if (type === "create") {
        response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch(`/api/operators/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || 'Erro ao salvar');
      }

      console.log('✅ Sucesso:', result);
      alert(`${type === "create" ? "Criado" : "Atualizado"} com sucesso!`);
      window.location.reload();

    } catch (error) {
      console.error('❌ Erro:', error);
      alert(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  });

  // Get creator name
  const creatorName = currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() : 'Admin';

  return (
    <form id={formId} className="w-full grid grid-cols-1 gap-8 lg:grid-cols-3" onSubmit={onSubmit}>
      
      {/* Header Section */}
      <div className="lg:col-span-3 flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-gray-800">
          {type === "create" ? "Criar novo" : "Editar"} {tableLabel}
        </h1>
        <div className="text-sm text-gray-600">
          Criado por: <span className="font-semibold text-purple-600">{creatorName}</span>
        </div>
      </div>

      {/* USER ID SECTION (Edit Mode Only) */}
      {type === "edit" && (
        <div className="lg:col-span-3">
          <p className="text-xs text-gray-500 font-medium mb-1">ID do Utilizador:</p>
          {isLoadingUser ? (
            <p className="text-sm text-gray-500">A carregar...</p>
          ) : userData ? (
            <div className="p-2 bg-gray-50 rounded-md flex justify-between items-center">
              <div>
                <span className="text-sm font-semibold text-black">
                  #{userData.id}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  ({userData.email})
                </span>
              </div>
              <span className="text-xs text-gray-500">
                Criado: {new Date(userData.created_at).toLocaleString('pt-PT')}
              </span>
            </div>
          ) : (
            <p className="text-sm text-red-500">Erro ao carregar utilizador</p>
          )}
        </div>
      )}

      {/* Current Role Section (Edit Mode) */}
      {type === "edit" && userData && (
        <div className="lg:col-span-3">
          <p className="text-xs text-gray-500 font-medium mb-1">Role Atual:</p>
          <div className="p-2 bg-gray-50 rounded-md">
            <span className="text-sm font-semibold text-black">{userData.role}</span>
            <span className={`ml-3 text-xs px-2 py-1 rounded ${userData.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {userData.is_active ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </div>
      )}
      
      <span className="text-xs text-gray-500 font-medium lg:col-span-3 mt-4">
        Informação Pessoal
      </span>

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

      {/* Password field - only for CREATE */}
      {type === "create" && (
        <InputField 
          label="Password" 
          name="password" 
          register={register} 
          error={errors.password} 
          inputProps={{ type: "password" }} 
        />
      )}

      {/* Role selection - only for CREATE */}
      {type === "create" && (
        <div className="lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Utilizador
          </label>
          <select
            {...register('role')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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

      {isSubmitting && (
        <div className="lg:col-span-3 text-center">
          <p className="text-purple-600 font-semibold">A guardar...</p>
        </div>
      )}
    </form>
  );
};

export default OperadoresForm;