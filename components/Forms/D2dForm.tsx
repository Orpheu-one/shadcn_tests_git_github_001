"use client"

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import InputField from '../InputField';
import React from 'react';

const schema = z.object({
  username: z.string().min(3, { message: "O teu Username tem que ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Insira um email válido" }),
  password: z.string().min(8, { message: "A password tem que ter pelo menos 8 caracteres" }).max(20, { message: "A password deve ter no máximo 20 caracteres" }),
  name: z.string().min(3, { message: "O nome tem que ter pelo menos 3 caracteres" }).max(20, { message: "O nome deve ter no máximo 20 caracteres" }),
  apelido: z.string().min(3, { message: "O apelido tem que ter pelo menos 3 caracteres" }).max(20, { message: "O nome deve ter no máximo 20 caracteres" }),
  phone: z.string().min(8, { message: "Número de telefone é obrigatório" }),
  address: z.string().min(15, { message: "A morada é obrigatória" }),
  birthday: z.string().min(1, { message: "Coloca a tua data de nascimento" }),
  genero: z.enum(["Masculino", "Feminino", "Prefiro não especificar"], { message: "Escolhe uma opção" }),
  img: z.any().optional(), 
});

type FormValues = z.infer<typeof schema>;

const D2dForm = ({ 
  type, 
  data, 
  tableLabel, 
  formId 
}: { 
  type: "create" | "edit"; 
  data?: unknown; 
  tableLabel: string;
  formId: string; 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit((data) => {
    console.log("D2D Submit (Dados do Vendedor):", data); 
    // Lógica para enviar para a BD
  });

  return (
    <form id={formId} className="w-full grid grid-cols-1 gap-8 lg:grid-cols-3" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold text-gray-800 lg:col-span-3">
        {type === "create" ? "Criar Novo" : "Editar"} {tableLabel}
      </h1>
      
      <span className="text-xs text-gray-500 font-medium lg:col-span-3">Verificar Identificação</span>

      <InputField label="Username" name="username" register={register} error={errors.username} inputProps={{}} />
      <InputField label="Email" name="email" register={register} error={errors.email} inputProps={{ type: "email" }} />
      <InputField label="Password" name="password" register={register} error={errors.password} inputProps={{ type: "password" }} />
      
      <span className="text-xs text-gray-500 font-medium lg:col-span-3">Informação Pessoal</span>
      
      <InputField label="Name" name="name" register={register} error={errors.name} inputProps={{}} />
      <InputField label="Apelido" name="apelido" register={register} error={errors.apelido} inputProps={{}} />
      <InputField label="Número de Telefone" name="phone" register={register} error={errors.phone} inputProps={{}} />
      <InputField label="Morada" name="address" register={register} error={errors.address} inputProps={{}} />
      <InputField label="Data de Nascimento" name="birthday" register={register} error={errors.birthday} inputProps={{ type: "date" }} />
      
      <InputField label="Género" name="genero" register={register} error={errors.genero} inputProps={{ type: "text", placeholder: "Masculino/Feminino" }} />
      
      <InputField label="Imagem de Perfil" name="img" register={register} error={errors.img} inputProps={{ type: "file" }} />
    </form>
  );
};

export default D2dForm;