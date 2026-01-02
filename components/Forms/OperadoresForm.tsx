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

// Schema for CREATE - password OBRIGATÓRIA
const createSchema = z.object({
  email: z.string().email({ message: "Insira um email válido" }),
  name: z.string().min(3, { message: "Mínimo 3 caracteres" }),
  apelido: z.string().min(3, { message: "Mínimo 3 caracteres" }),
  internalId: z.string().min(4, { message: "Mínimo 4 caracteres (username e password)" }),
  phone: z.string().min(8, { message: "Número obrigatório" }),
  role: z.enum(['OPERATOR', 'SUPERVISOR', 'D2D', 'ADMIN'], { message: "Escolha um role" }),
  password: z.string().min(4, { message: "Mínimo 4 caracteres" }),
});

// Schema for EDIT - password opcional
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

  // Fetch user data for EDIT mode
  useEffect(() => {
    if (type === "edit" && userId) {
      const fetchUserData = async () => {
        setIsLoadingUser(true);
        try {
          const data = await getOperatorById(userId);
          if (!data) {
            throw new Error(`Utilizador não encontrado.`);
          }
          setUserData(data as FetchedUserData);

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
    console.log("🚀 Form submitted:", formData);
    
    const tid = toast.loading(type === "create" ? "A criar utilizador..." : "A atualizar utilizador...");
    
    startTransition(async () => {
      try {
        let result;

        if (type === "create") {
          const createData = formData as CreateFormValues;
          
          // CRITICAL: Use internalId as password
          result = await createSystemUser({
            email: createData.email,
            name: createData.name,
            apelido: createData.apelido,
            internalId: createData.internalId,
            phone: createData.phone,
            password: createData.internalId, // ← PASSWORD = INTERNAL ID
            role: createData.role as UserRole,
          });

          console.log("✅ Create result:", result);
        } else {
          if (!userId) {
            toast.error("ID do utilizador não fornecido", { id: tid });
            return;
          }

          const editData = formData as EditFormValues;
          
          result = await updateSystemUser(userId, {
            name: editData.name,
            apelido: editData.apelido,
            email: editData.email,
            phone: editData.phone,
            password: editData.password,
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

  return (
    <form id={formId} className="w-full grid grid-cols-1 gap-6 lg:grid-cols-3" onSubmit={onSubmit}>
      {/* ERROR ALERT */}
      {type === "edit" && !userId && (
        <div className="lg:col-span-3 p-4 bg-red-100 border border-red-400 rounded-md">
          <p className="text-red-800 font-bold text-sm">⚠️ ERRO: userId não foi passado!</p>
        </div>
      )}

      {/* HEADER */}
      <div className="lg:col-span-3 flex justify-between items-center mb-2">
        <h1 className="text-xl font-semibold text-gray-800">
          {type === "create" ? "Criar novo" : "Editar"} {tableLabel}
        </h1>
        <div className="text-sm text-gray-600">
          <div className="flex flex-col items-end">
            <span className="font-semibold text-purple-600 text-sm">{currentUserName}</span>
            <span className="text-xs text-gray-500 capitalize">{currentUserRole}</span>
          </div>
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
                  <span className="text-sm font-semibold text-gray-800 ml-2">#{userData.id}</span>
                </div>
                <span className="text-xs text-gray-500">
                  Criado: {new Date(userData.created_at).toLocaleString('pt-PT')}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-xs text-gray-500">Clerk ID:</span>
                  <p className="text-gray-800 font-mono text-xs break-all">{userData.userId}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Internal ID:</span>
                  <p className="text-gray-800 font-mono text-xs">{userData.internalId}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Telefone:</span>
                  <p className="text-gray-800 text-xs">{userData.phone || 'N/A'}</p>
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
            <span className="text-sm font-semibold text-gray-800">{userData.role}</span>
            <span className={`text-xs px-2 py-1 rounded ${userData.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {userData.is_active ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </div>
      )}

      {/* SECTION: Informação Pessoal */}
      <span className="text-xs text-gray-500 font-medium lg:col-span-3 mt-2 border-b border-gray-200 pb-1">
        Informação Pessoal
      </span>

      <InputField 
        label="Nome" 
        name="name" 
        register={register} 
        error={errors.name} 
        inputProps={{ className: "text-sm px-2 text-gray-800" }} 
      />
      
      <InputField 
        label="Apelido" 
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
        label="Email" 
        name="email" 
        register={register} 
        error={errors.email} 
        inputProps={{ 
          type: "email",
          placeholder: "exemplo@email.com",
          className: "text-sm px-2 text-gray-800"
        }} 
      />

      {/* SECTION: Credenciais (Only for CREATE) */}
      {type === "create" && (
        <>
          <span className="text-xs text-gray-500 font-medium lg:col-span-3 mt-2 border-b border-gray-200 pb-1">
            Credenciais de Acesso
          </span>

          <InputField 
            label="ID Interno (username e password)" 
            name="internalId" 
            register={register} 
            error={errors.internalId} 
            inputProps={{ 
              placeholder: "Ex: OPER0001 (mín. 8 chars)",
              className: "text-sm px-2 text-gray-800"
            }} 
          />

          <InputField 
            label="Password"
            name="password" 
            register={register} 
            error={errors.password} 
            inputProps={{ 
              type: "password",
              placeholder: "Mínimo 8 caracteres",
              className: "text-sm px-2 text-gray-800"
            }} 
          />

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Utilizador
            </label>
            <select
              {...register('role')}
              className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-800 bg-white"
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
        </>
      )}

      {/* PASSWORD - Only for EDIT (optional) */}
      {type === "edit" && (
        <>
          <span className="text-xs text-gray-500 font-medium lg:col-span-3 mt-2 border-b border-gray-200 pb-1">
            Alterar Password (Opcional)
          </span>

          <InputField 
            label="Nova Password"
            name="password" 
            register={register} 
            error={errors.password} 
            inputProps={{ 
              type: "password",
              placeholder: "Mínimo 8 caracteres",
              className: "text-sm px-2 text-gray-800"
            }} 
          />
        </>
      )}

      {/* INFO BOX for CREATE */}
      {type === "create" && (
        <div className="lg:col-span-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            ℹ️ <strong>Nota:</strong> O ID Interno será usado como username e password inicial no Clerk. 
            Deve ter mínimo 8 caracteres.
          </p>
        </div>
      )}

      {/* LOADING */}
      {isPending && (
        <div className="lg:col-span-3 text-center py-4">
          <p className="text-purple-600 font-semibold text-sm">A processar...</p>
        </div>
      )}
    </form>
  );
};

export default OperadoresForm;