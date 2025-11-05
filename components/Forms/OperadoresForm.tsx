"use client"

import { z } from 'zod';

const schema = z.object({
  username: z.string().min(3, {message:"O teu User Name tem 4 caracteres"}),
  email: z.string().email({message:"Insira um email valido"}),
  password: z.string().min(8, {message:"A password tem que ter pelo menos 8 caracteres"}).max(20, {message:"A password deve ter no maximo 20 caracteres"}),
  nome: z.string().min(3, {message:"O nome tem que ter pelo menos 3 caracteres"}).max(20, {message:"O nome deve ter no maximo 20 caracteres"}),
  apelido: z.string().min(3, {message:"O apelido tem que ter pelo menos 3 caracteres"}).max(20, {message:"O nome deve ter no maximo 20 caracteres"}),
  phone: z.string().min(8, {message:"Numero de telefone e obrigatorio"}),
  address: z.string().min(15, {message:"A morada e obrigatoria"}),
  birthday: z.date({message:"Coloca a tua data de nascimento"}),
  genero: z.enum(["Masculino","Feminino","Prefiro não especificar"], {message:"Escolhe uma opção"}),
  img: z.instanceof(File, {message:"Escolhe uma imagem"}),
});
 


const OperadoresForm = ({type, data}:{type:"create" | "edit"; data?:unknown}) => {
  return (
    <form className=''>OperadoresForm</form>
  )
}

export default OperadoresForm