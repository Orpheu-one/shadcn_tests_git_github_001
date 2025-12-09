"use client"

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import InputField from '../InputField';
import React from 'react';

const schema = z.object({
  username: z.string().min(3, { message: "O username tem que ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Insira um email valido" }),
  password: z.string().min(8, { message: "A password tem que ter pelo menos 8 caracteres" }).max(20, { message: "A password deve ter no maximo 20 caracteres" }),
  name: z.string().min(3, { message: "O nome tem que ter pelo menos 3 caracteres" }).max(20, { message: "O nome deve ter no maximo 20 caracteres" }),
  apelido: z.string().min(3, { message: "O apelido tem que ter pelo menos 3 caracteres" }).max(20, { message: "O nome deve ter no maximo 20 caracteres" }),
  phone: z.string().min(8, { message: "Numero de telefone é obrigatorio" }),
  address: z.string().min(15, { message: "A morada é obrigatoria" }),
  // Ajusta conforme a necessidade real de Operadores (ex: data de nascimento, etc)
});

type FormValues = z.infer<typeof schema>;

const SupervisorForm = ({ 
  type, 
  data, 
  tableLabel, 
  formId 
}: { 
  type: "create" | "edit"; 
  data?: unknown; 
  tableLabel: string;
  formId: string; // <-- OBRIGATÓRIO: Para ligar ao botão "Salvar" do Modal
}) => {
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit((data) => {
    console.log("Operador Submit:", data);
    // Lógica de envio para BD
  });

  return (
    // O ID aqui conecta este formulário ao botão que está no FormModal
    <form id={formId} className="w-full grid grid-cols-1 gap-8 lg:grid-cols-3" onSubmit={onSubmit}>
      
      <h1 className="text-xl font-semibold text-gray-800 lg:col-span-3">
        {type === "create" ? "Criar novo" : "Editar"} {tableLabel}
      </h1>
      
      <span className="text-xs text-gray-500 font-medium lg:col-span-3">Credenciais de Acesso</span>
      
      <InputField label="Username" name="username" username='' register={register} error={errors.username} inputProps={{}} />
      <InputField label="Email" name="email" username='' register={register} error={errors.email} inputProps={{ type: "email" }} />
      <InputField label="Password" name="password" username='' register={register} error={errors.password} inputProps={{ type: "password" }} />
      
      <span className="text-xs text-gray-500 font-medium lg:col-span-3">Informação Pessoal</span>

      <InputField label="Nome" name="name" username='' register={register} error={errors.name} inputProps={{}} />
      <InputField label="Apelido" name="apelido" username='' register={register} error={errors.apelido} inputProps={{}} />
      <InputField label="Telefone" name="phone" username='' register={register} error={errors.phone} inputProps={{}} />
      <InputField label="Morada" name="address" username='' register={register} error={errors.address} inputProps={{}} />

      {/* SEM BOTÕES AQUI - O FormModal trata disso */}
    </form>
  );
};

export default SupervisorForm;