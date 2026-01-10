// components/EventSinglePage.tsx
import React from 'react';
import { Event, Client, User } from '@prisma/client';

// Definimos o tipo de dados que este componente espera receber
// É um Evento que contém obrigatoriamente um Client e um User dentro
type EventWithDetails = Event & {
  client: Client;
  user: User;
};

interface EventSinglePageProps {
  data: EventWithDetails;
  title: string; // Para poderes mudar o título para "Detalhes da Venda" ou "Detalhes do Callback"
}

export default function EventSinglePage({ data, title }: EventSinglePageProps) {
  
  // Função auxiliar para formatar datas
  const formatDate = (date: Date | null) => {
    if (!date) return "Não definido";
    return new Date(date).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      
      {/* Cabeçalho do Card */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-md font-bold text-gray-800 uppercase tracking-wide">
          {`${data.type} ${data.event_id}`}
        </h2>
         

        <div className="flex flex-col">
              {/*<span className="text-sm text-gray-500 mb-1">Canal</span>*/}
              <h3 className={`px-3 py-1 rounded-full text-xs font-semibold ${
          data.channel === 'REMOTE' ? 'bg-green-100 text-green-700' :
          data.channel === 'F2F' ? 'bg-yellow-300 text-gray-800' :
          'bg-gray-100 text-gray-800'
        }`}>{data.channel}</h3>
            
            </div>

        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          data.status === 'CLOSED' ? 'bg-green-100 text-green-700' :
          data.status === 'LOST' ? 'bg-red-100 text-red-600' :
          'bg-yellow-300 text-yellow-800'
        }`}>
          {data.status}
        </span>
      </div>

        {/* SECÇÃO 3: OPERADOR / VENDEDOR */}
        <div className='px-6'>
          <h4 className=" text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4 border-b pb-2">
            Responsável (User)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">ID Interno</span>
              <h3 className="text-lg font-medium text-gray-900">
                {data.user.internalId}
              </h3>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Nome</span>
              <h3 className="text-lg font-medium text-gray-900">
                {data.user.frst_name} {data.user.lst_name}
              </h3>
            </div>
            
          </div>
        </div>

      <div className="p-6 space-y-8">
        
        {/* SECÇÃO 1: DADOS DO CLIENTE */}
        <div>
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">
            Informação do Cliente
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Nome Completo</span>
              <h3 className="text-xs font-medium text-gray-600">
                {data.client.frst_name} {data.client.lst_name}
              </h3>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Telefone</span>
              <h3 className="text-xs font-medium text-gray-600">
                {data.client.phone}
              </h3>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Email</span>
              <h3 className="text-xs font-medium text-gray-600">
                {data.client.email || "N/A"}
              </h3>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Morada</span>
              <h3 className="text-xs font-medium text-gray-600">
                {data.client.address}
              </h3>
            </div>

             {/* Coordenadas se existirem */}
             <div className="flex flex-col md:col-span-2">
              <span className="text-sm text-gray-500 mb-1">Localização (Lat/Long)</span>
              <h3 className=" text-xs text-gray-600">
                {data.client.lat && data.client.long 
                  ? `${data.client.lat}, ${data.client.long}` 
                  : "Sem dados de GPS"}
              </h3>
            </div>
          </div>
        </div>

        {/* SECÇÃO 2: DETALHES DO EVENTO/VENDA */}
        <div>
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">
            Detalhes do Processo
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            

            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Tipo</span>
              <h3 className="text-base font-medium text-gray-900">
                {data.type}
              </h3>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Agendado Para</span>
              <h3 className="text-base font-medium text-gray-900">
                {formatDate(data.Scheduled)}
              </h3>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Criado Em</span>
              <h3 className="text-base font-medium text-gray-900">
                {formatDate(data.created_at)}
              </h3>
            </div>

             <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Callback Em</span>
              <h3 className="text-base font-medium text-gray-900">
                {formatDate(data.calledback_at)}
              </h3>
            </div>

          </div>

          <div className="mt-6 flex flex-col">
            <span className="text-sm text-gray-500 mb-1">Observações</span>
            <div className="bg-gray-50 p-4 rounded border border-gray-100 min-h-[100px]">
              <p className="text-gray-800 whitespace-pre-wrap">
                {data.obs || "Sem observações registadas."}
              </p>
            </div>
          </div>
        </div>

      

      </div>
    </div>
  );
}