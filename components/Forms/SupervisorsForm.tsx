"use client"

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import InputField from '../InputField';
import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';

const schema = z.object({
  username: z.string().min(3, { message: "O username tem que ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Insira um email valido" }),
  password: z.string().min(8, { message: "A password tem que ter pelo menos 8 caracteres" }).max(20, { message: "A password deve ter no maximo 20 caracteres" }),
  name: z.string().min(3, { message: "O nome tem que ter pelo menos 3 caracteres" }).max(20, { message: "O nome deve ter no maximo 20 caracteres" }),
  apelido: z.string().min(3, { message: "O apelido tem que ter pelo menos 3 caracteres" }).max(20, { message: "O nome deve ter no maximo 20 caracteres" }),
  phone: z.string().min(8, { message: "Numero de telefone é obrigatorio" }),
  address: z.string().min(15, { message: "A morada é obrigatoria" }),
});

type FormValues = z.infer<typeof schema>;

const SupervisorForm = ({ 
  type, 
  data, 
  tableLabel, 
  formId,
  onSuccess,
}: { 
  type: "create" | "edit"; 
  data?: unknown; 
  tableLabel: string;
  formId: string;
  onSuccess?: () => void;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit(async (formData) => {
    console.log("Supervisor Submit:", formData);
    const tid = toast.loading(type === "create" ? "A criar..." : "A atualizar...");
    setIsSubmitting(true);

    startTransition(async () => {
      try {
        // AQUI ADICIONA A TUA LÓGICA DE CRIAÇÃO/EDIÇÃO
        // Exemplo: await createSupervisor(formData);
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simula API call
        
        toast.success("Operação concluída!", { id: tid });
        
        if (onSuccess) onSuccess();
        
        await new Promise(resolve => setTimeout(resolve, 300));
        router.push('/lists/supervisores');
        router.refresh();
        
      } catch (error: any) {
        setIsSubmitting(false);
        toast.error(error.message || "Erro na submissão", { id: tid });
      }
    });
  });

  if (isSubmitting) {
    return (
      <div className="w-full grid grid-cols-1 gap-8 lg:grid-cols-3 relative min-h-[400px]">
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
    <form id={formId} className="w-full grid grid-cols-1 gap-8 lg:grid-cols-3" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold text-gray-800 lg:col-span-3">
        {type === "create" ? "Criar novo" : "Editar"} {tableLabel}
      </h1>
      
      <span className="text-xs text-gray-500 font-medium lg:col-span-3">Credenciais de Acesso</span>
      
      <InputField label="Username" name="username" register={register} error={errors.username} inputProps={{ className: "text-sm px-2 text-gray-800" }} />
      <InputField label="Email" name="email" register={register} error={errors.email} inputProps={{ type: "email", className: "text-sm px-2 text-gray-800" }} />
      <InputField label="Password" name="password" register={register} error={errors.password} inputProps={{ type: "password", className: "text-sm px-2 text-gray-800" }} />
      
      <span className="text-xs text-gray-500 font-medium lg:col-span-3">Informação Pessoal</span>

      <InputField label="Nome" name="name" register={register} error={errors.name} inputProps={{ className: "text-sm px-2 text-gray-800" }} />
      <InputField label="Apelido" name="apelido" register={register} error={errors.apelido} inputProps={{ className: "text-sm px-2 text-gray-800" }} />
      <InputField label="Telefone" name="phone" register={register} error={errors.phone} inputProps={{ className: "text-sm px-2 text-gray-800" }} />
      <InputField label="Morada" name="address" register={register} error={errors.address} inputProps={{ className: "text-sm px-2 text-gray-800" }} />
    </form>
  );
};

export default SupervisorForm;