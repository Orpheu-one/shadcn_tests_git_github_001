"use client"

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import InputField from '../InputField';
import React, { useState, useEffect, useTransition } from 'react';
import { useUser } from '@clerk/nextjs';
import { createSystemUser, updateSystemUser, getOperatorById } from '@/lib/actions/user.actions';
import { toast } from 'sonner';
import { UserRole } from '@prisma/client';

// Schema with password for CREATE
const createSchema = z.object({
  email: z.string().email({ message: "Insira um email válido" }),
  name: z.string().min(3, { message: "Mínimo 3 caracteres" }),
  apelido: z.string().min(3, { message: "Mínimo 3 caracteres" }),
  internalId: z.string().min(4, { message: "A ID é obrigatória e tem 4 caracteres" }),
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
  password: z.string().min(8, { message: "Mínimo 8 caracteres" }).optional().or(z.literal('')),
});

type CreateFormValues = z.infer<typeof createSchema>;
type EditFormValues = z.infer<typeof editSchema>;

type FetchedUserData = {
  id: number;
  userId: string;
  email: string;
  internalId: string;
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
  userId,
  internalId,
  role,
}: { 
  type: "create" | "edit"; 
  data?: unknown; 
  tableLabel: string;
  formId: string;
  userId?: string;
  internalId?: string;
  role: UserRole;
}) => {
  
  const [isPending, startTransition] = useTransition();
  const [userData, setUserData] = useState<FetchedUserData | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const { user: currentUser } = useUser();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateFormValues | EditFormValues>({
    resolver: zodResolver(type === "create" ? createSchema : editSchema),
  });

  // ✅ FETCH USER DATA usando Server Action (Edit Mode)
  useEffect(() => {
    if (type === "edit" && userId) {
      const fetchUserData = async () => {
        setIsLoadingUser(true);
        try {
          const data = await getOperatorById(userId);
          
          if (!data) {
            throw new Error(`Utilizador com ID ${userId} não encontrado.`);
          }
          
          setUserData(data as FetchedUserData);

          // Pre-fill form fields
          setValue('name', data.frst_name);
          setValue('apelido', data.lst_name);
          setValue('email', data.email);
          setValue('phone', data.phone || '');

        } catch (error) {
          console.error("❌ Erro ao carregar utilizador:", error);
          toast.error("Erro ao carregar dados do utilizador");
          setUserData(null);
        } finally {
          setIsLoadingUser(false);
        }
      };
      
      fetchUserData();
    }
  }, [type, userId, setValue]);

  const onSubmit = handleSubmit(async (formData) => {
    startTransition(async () => {
      try {
        let result;

        if (type === "create") {
          // ✅ CREATE usando Server Action
          result = await createSystemUser({
            email: formData.email,
            name: formData.name,
            apelido: formData.apelido,
            phone: formData.phone,
            password: formData.password as string,
            role: formData.role as UserRole,
          });
        } else {
          // ✅ UPDATE usando Server Action
          if (!userId) {
            toast.error("ID do utilizador não fornecido");
            return;
          }

          result = await updateSystemUser(userId, {
            name: formData.name,
            apelido: formData.apelido,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
          });
        }

        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success(result?.message || `${type === "create" ? "Criado" : "Atualizado"} com sucesso!`);
          window.location.reload();
        }

      } catch (error) {
        console.error('❌ Erro no submit:', error);
        toast.error('Erro desconhecido');
      }
    });
  });

  const creatorName = currentUser 
    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() 
    : `${internalId} ${role}`;

  return (
    <form id={formId} className="w-full grid grid-cols-1 gap-8 lg:grid-cols-3" onSubmit={onSubmit}>
      
      {/* ERROR ALERT */}
      {type === "edit" && !userId && (
        <div className="lg:col-span-3 p-4 bg-red-100 border border-red-400 rounded-md">
          <p className="text-red-800 font-bold">⚠️ ERRO: userId não foi passado!</p>
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

      {/* USER INFO (Edit Mode) */}
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

      {/* ROLE (Edit Mode) */}
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
      <InputField label="Nome" name="name" register={register} error={errors.name} inputProps={{}} />
      <InputField label="Apelido" name="apelido" register={register} error={errors.apelido} inputProps={{}} />
      <InputField label="ID Interno" name="internalId" register={register} error={errors.internalId} inputProps={{}} />
      <InputField label="Email" name="email" register={register} error={errors.email} inputProps={{ type: "email" }} />
      <InputField label="Telefone" name="phone" register={register} error={errors.phone} inputProps={{}} />

      {/* PASSWORD */}
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

      {/* ROLE (Create Mode) */}
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

      {/* LOADING */}
      {isPending && (
        <div className="lg:col-span-3 text-center">
          <p className="text-purple-600 font-semibold">A guardar...</p>
        </div>
      )}
    </form>
  );
};

export default OperadoresForm;