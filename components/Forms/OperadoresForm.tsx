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

// Schema for CREATE
const createSchema = z.object({
  email: z.string().email({ message: "Insira um email válido" }),
  name: z.string().min(3, { message: "Mínimo 3 caracteres" }),
  apelido: z.string().min(3, { message: "Mínimo 3 caracteres" }),
  internalId: z.string().length(4, { message: "O ID deve ter exatamente 4 caracteres" }),
  phone: z.string().optional(),
  role: z.enum(['OPERATOR', 'SUPERVISOR', 'D2D', 'ADMIN'], { message: "Escolha um role" }),
});

// Schema for EDIT
const editSchema = z.object({
  email: z.string().email({ message: "Insira um email válido" }),
  name: z.string().min(3, { message: "Mínimo 3 caracteres" }),
  apelido: z.string().min(3, { message: "Mínimo 3 caracteres" }),
  phone: z.string().optional(),
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
  created_at: Date;
}

const OperadoresForm = ({ 
  type, 
  tableLabel, 
  formId,
  userId,
}: { 
  type: "create" | "edit"; 
  tableLabel: string;
  formId: string;
  userId?: string;
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

  const currentUserRole = currentUser?.publicMetadata?.role as string || 'N/A';
  const currentUserName = `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'N/A';

  useEffect(() => {
    if (type === "edit" && userId) {
      const fetchUserData = async () => {
        setIsLoadingUser(true);
        try {
          const data = await getOperatorById(userId);
          if (!data) throw new Error("Utilizador não encontrado.");
          
          setUserData(data as any);
          setValue('name', data.frst_name);
          setValue('apelido', data.lst_name);
          setValue('email', data.email);
          setValue('phone', data.phone || '');

        } catch (error) {
          console.error("Erro:", error);
          toast.error("Erro ao carregar dados");
        } finally {
          setIsLoadingUser(false);
        }
      };
      fetchUserData();
    }
  }, [type, userId, setValue]);

  const onSubmit = handleSubmit(async (formData) => {
    const tid = toast.loading(type === "create" ? "A criar..." : "A atualizar...");
    
    startTransition(async () => {
      try {
        let result;

        if (type === "create") {
          const data = formData as CreateFormValues;
          result = await createSystemUser({
            ...data,
            password: data.internalId + "2025", // Senha temporária já que internalId tem só 4 chars
          });
        } else {
          if (!userId) return;
          const data = formData as EditFormValues;
          result = await updateSystemUser(userId, data);
        }

        if (result?.error) {
          toast.error(result.error, { id: tid });
        } else {
          toast.success("Sucesso!", { id: tid });
          setTimeout(() => window.location.reload(), 1500);
        }
      } catch (error: any) {
        toast.error("Erro inesperado", { id: tid });
      }
    });
  });

  return (
    <form id={formId} className="w-full grid grid-cols-1 gap-6 lg:grid-cols-2" onSubmit={onSubmit}>
      <div className="lg:col-span-2 flex justify-between items-center mb-2">
        <h1 className="text-xl font-semibold text-gray-800">
          {type === "create" ? "Criar novo" : "Editar"} {tableLabel}
        </h1>
        <div className="text-right">
          <p className="font-semibold text-purple-600 text-sm">{currentUserName}</p>
          <p className="text-xs text-gray-500 capitalize">{currentUserRole}</p>
        </div>
      </div>

      <InputField 
        label="Nome" name="name" register={register} error={errors.name} 
        inputProps={{ className: "text-sm px-2 text-gray-800" }} 
      />
      
      <InputField 
        label="Apelido" name="apelido" register={register} error={errors.apelido} 
        inputProps={{ className: "text-sm px-2 text-gray-800" }} 
      />

      <InputField 
        label="Email" name="email" register={register} error={errors.email} 
        inputProps={{ type: "email", className: "text-sm px-2 text-gray-800" }} 
      />

      <InputField 
        label="Telefone" name="phone" register={register} error={errors.phone} 
        inputProps={{ className: "text-sm px-2 text-gray-800" }} 
      />

      {type === "create" && (
        <>
          <InputField 
            label="ID Interno (4 letras)" name="internalId" register={register} error={errors.internalId} 
            inputProps={{ maxLength: 4, placeholder: "Ex: JOSE", className: "text-sm px-2 text-gray-800" }} 
          />
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Tipo de Utilizador</label>
            <select
              {...register('role')}
              className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-gray-800 bg-white"
            >
              <option value="">Selecione...</option>
              <option value="OPERATOR">Operador</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="D2D">Vendedor (D2D)</option>
              <option value="ADMIN">Administrador</option>
            </select>
            {errors.role && <p className="text-red-500 text-xs">{errors.role.message}</p>}
          </div>
        </>
      )}

      {type === "edit" && (
        <InputField 
          label="Nova Password (Opcional)" name="password" register={register} error={errors.password} 
          inputProps={{ type: "password", className: "text-sm px-2 text-gray-800" }} 
        />
      )}

      {isPending && <p className="lg:col-span-2 text-center text-purple-600 font-semibold">A processar...</p>}
    </form>
  );
};

export default OperadoresForm;