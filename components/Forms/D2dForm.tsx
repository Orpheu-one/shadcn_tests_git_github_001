"use client"

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import InputField from '../InputField';
import React from 'react';

const schema = z.object({
  username: z.string().min(3, { message: "O teu Username tem 4 caracteres" }),
  email: z.string().email({ message: "Insira um email valido" }),
  password: z.string().min(8, { message: "A password tem que ter pelo menos 8 caracteres" }).max(20, { message: "A password deve ter no maximo 20 caracteres" }),
  name: z.string().min(3, { message: "O nome tem que ter pelo menos 3 caracteres" }).max(20, { message: "O nome deve ter no maximo 20 caracteres" }),
  apelido: z.string().min(3, { message: "O apelido tem que ter pelo menos 3 caracteres" }).max(20, { message: "O nome deve ter no maximo 20 caracteres" }),
  phone: z.string().min(8, { message: "Numero de telefone é obrigatorio" }),
  address: z.string().min(15, { message: "A morada é obrigatoria" }),
  birthday: z.date({ message: "Coloca a tua data de nascimento" }),
  genero: z.enum(["Masculino", "Feminino", "Prefiro não especificar"], { message: "Escolhe uma opção" }),
  img: z.instanceof(File, { message: "Escolhe uma imagem" }),
});

type FormValues = z.infer<typeof schema>;

const D2dForm = ({ type, data, tableLabel }: { type: "create" | "edit"; data?: unknown; tableLabel: string }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit((data) => {
    console.log(data);
  });

  React.useEffect(() => {
    const handleResize = () => {
      const formElement = document.getElementById('d2d-form');
      if (window.innerWidth <= 768 && formElement) {
        formElement.style.overflowY = 'auto';
        formElement.style.maxHeight = '90vh';
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <form id="d2d-form" className="w-full grid grid-cols-1 gap-8 lg:grid-cols-3" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold text-gray-800 lg:col-span-3">
        {type === "create" ? "Criar um novo" : "Editar"} {tableLabel}
      </h1>
      <span className="text-xs text-gray-500 font-medium lg:col-span-3">Verificar Identificação</span>

      <InputField label="Username" name="username" username='' register={register} error={errors.username} inputProps={{}} />
      <InputField label="Email" name="email" username='' register={register} error={errors.email} inputProps={{ type: "email" }} />
      <InputField label="Password" name="password" username='' register={register} error={errors.password} inputProps={{ type: "password" }} />
      <span className="text-xs text-gray-500 font-medium lg:col-span-3">Informação Pessoal</span>
      <InputField label="Name" name="name" username='' register={register} error={errors.name} inputProps={{}} />
      <InputField label="Apelido" name="apelido" username='' register={register} error={errors.apelido} inputProps={{}} />
      <InputField label="Número de Telefone" name="phone" username='' register={register} error={errors.phone} inputProps={{}} />
      <InputField label="Morada" name="address" username='' register={register} error={errors.address} inputProps={{}} />
      <InputField label="Data de Nascimento" name="birthday" username='' register={register} error={errors.birthday} inputProps={{ type: "date" }} />
      <InputField label="Género" name="genero" username='' register={register} error={errors.genero} inputProps={{ type: "select" }} />
      <InputField label="Imagem de Perfil" name="img" username='' register={register} error={errors.img} inputProps={{ type: "file" }} />

      <button type="submit" className="bg-purple-500 text-white py-2 px-4 rounded-md lg:col-span-3">
        {type === "create" ? "Criar" : "Editar"}
      </button>
    </form>
  );
};

export default D2dForm;
