import Image from "next/image"
import BigCalendar from "@/components/BigCalendar"
import React from "react"
import Link from "next/link"
import ListaVendas from "@/components/ListaVendas"
import RetrievelGraph from "@/components/RetrievelGraph"
import prisma from "@/lib/prisma";
// 1. Importar o namespace Prisma, que contém as ferramentas de tipagem (utilities)
import { Prisma } from "@prisma/client"; 
import { notFound } from 'next/navigation';


interface OperadorPageProps {
  // 'params' contém o segmento dinâmico da URL, neste caso, o [id]
  params: {
    id: string;
  };
}

// 1. DEFINIÇÃO DO TIPO: Usamos a ferramenta Prisma para saber o que está dentro do objeto.
type UserWithEvents = Prisma.UserGetPayload<{
    include: { events: true }; 
}>;

// 2. FUNÇÃO DE PÁGINA ASSÍNCRONA ÚNICA: Tem de ser 'async' para poder usar 'await'.
export default async function OperadorPage({ params }: OperadorPageProps) {
    
    // Extraímos o ID do URL
    const { id } = params;

    // Garante que o ID é um número para a query do Prisma
    const idNumber = parseInt(id, 10);

    // Se o ID não for um número válido, devolvemos 404
    if (isNaN(idNumber)) {
        notFound(); 
    }
    
    // --- 3. CONSULTA DOS DADOS ---
    // A palavra-chave 'await' espera a resposta da base de dados.
    const operador: UserWithEvents | null = await prisma.user.findUnique({
        where: { id: idNumber }, // Assumi que o campo é 'id' (Int), em vez de 'userId'
        include: { events: true }, 
    });

    // 4. VERIFICAÇÃO DE SEGURANÇA: Se não for encontrado, mostramos um erro.
    if (!operador) {
        return (
            <div className="p-8 text-center bg-red-100 text-red-700 rounded-lg">
                <p>Erro: Operador com ID "{id}" não encontrado.</p>
            </div>
        );
    }
    // --- Fim da Lógica de Consulta ---


    // 5. DESESTRUTURAÇÃO 
    const { 
        email, 
        avatar, 
        userId: operadorId, // Criamos a variável 'operadorId'
        phone,
        frst_name,
        lst_name,
        events 
    } = operador; 

return (

  <div className="flex-1 p-4 flex flex-col xl:flex-row gap-4">
    {/* LEFT */}
    <div className="w-full xl:w-2/3">
      {/* TOP */}
      <div className="flex flex-col xl:flex-row gap-4">
        {/* USER INFO CARD */}
        <div className="bg-purple-400 py-6 px-4 rounded-lg flex-1 flex gap-4">
          <div className="w-1/3">
            {/* O seu avatar da DB está aqui: */}
            <Image src={avatar || 'https://placehold.co/144x144/9333ea/ffffff?text=OP'} alt="" width={80} height={80} className="w-36 h-36 rounded-full object-cover" />
          </div>
          <div className="w-2/3 flex flex-col justify-between gap-4">
            <h1 className="text-xl font-semibold">John Doe</h1>
            <p className="text-sm text-gray-600">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.</p>
            <div className="flex mt-2 items-center justify-between gap-2">
              <h2 className="text-md font-semibold text-gray-800">{operadorId}</h2>
              <h2 className="text-lg font-bold text-gray-800">TEAM</h2>
            </div>
            <div className="mt-1 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Image src="/mail.png" alt="email" width={18} height={18} />
                <span className="text-black text-xs">{email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Image src="/phone.png" alt="phone" width={16} height={16} />
                <span className="text-black text-xs">{phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* USER SMALL CARD */}
        <div className="flex-1 flex gap-4 flex-col md:flex-row flex-wrap justify-between text-gray-600">
          {/* CARD 0 */}
          <div className="bg-yellow-300 p-4 rounded-md flex gap-4 w-full md:w-[48%]">
            <Image src="/class.png" alt="" width={24} height={24} className="w-7 h-7" />
            <div>
              <h1  className="text-xl font-bold">90%</h1>
              <span>Item_0</span>
            </div>
          </div>

          {/* CARD 1 */}
          <div className="bg-purple-400 p-4 rounded-md flex gap-4 w-full md:w-[48%]">
            <Image src="/class.png" alt="" width={24} height={24} className="w-7 h-7" />
            <div>
              <h1 className="text-xl font-bold">23</h1>
              <span>Item_1</span>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="bg-pink-300 p-4 rounded-md flex gap-4 w-full md:w-[48%]">
            <Image src="/class.png" alt="" width={24} height={24} className="w-7 h-7" />
            <div>
              <h1 className="text-xl font-bold">50</h1>
              <span>Item_2</span>
            </div>
          </div>

          {/* CARD 3 */}
          <div className="bg-blue-300 p-4 rounded-md flex gap-4 w-full md:w-[48%]">
            <Image src="/class.png" alt="" width={24} height={24} className="w-7 h-7" />
            <div>
              <h1 className="text-xl font-bold">100</h1>
              <span>Item_3</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="mt-4 bg-white p-4 rounded-lg">
        
          <BigCalendar />
        
      </div>
    </div>

    {/* RIGHT */}
    <div className="w-full xl:w-1/3 flex flex-col gap-4">
    
    <div className="bg-white p-4 rounded-lg">
       <h1 className="text-sm text-gray-500 font-semibold ">Shotcuts</h1> 
       <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
        <Link href="/" className="p-2 bg-purple-300 rounded-md hover:bg-purple-500">Dashboard</Link>
        <Link href="/" className="p-2 bg-pink-300 rounded-md hover:bg-purple-500">Dashboard</Link>
        <Link href="/" className="p-2 bg-yellow-300 rounded-md hover:bg-purple-500">Dashboard</Link>
        <Link href="/" className="p-2 bg-purple-300 rounded-md hover:bg-purple-500">Dashboard</Link>
        <Link href="/" className="p-2 bg-blue-300 rounded-md hover:bg-purple-500">Dashboard</Link>
       </div>
        
    </div>
    <div className="flex bg-white p-4 rounded-lg justify-center items-center">

        <RetrievelGraph />


    </div>
        <ListaVendas/> 

    
    
    </div>
  </div>
)
} //