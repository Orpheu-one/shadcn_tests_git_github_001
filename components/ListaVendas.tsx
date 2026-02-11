"use client"

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getVendasByUser } from "@/lib/actions/user.actions";

interface Venda {
  id: number;
  event_id: string;
  clientName: string;
  created_at: Date;
}

const ListaVendas = () => {
  const { userId, sessionClaims } = useAuth();
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🎯 Detectar role do Clerk
  const userRole = ((sessionClaims?.metadata as any)?.userRole || 
                    (sessionClaims?.publicMetadata as any)?.role || 
                    'operator').toLowerCase();

  const isAdmin = ['admin', 'supervisor'].includes(userRole);

  // 🔥 Função de fetch (reutilizável)
  const fetchVendas = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔄 [ListaVendas] Buscando vendas...');
      const data = await getVendasByUser(userId);
      console.log('✅ [ListaVendas] Vendas recebidas:', data.length);
      setVendas(data);
    } catch (error) {
      console.error('❌ [ListaVendas] Erro ao carregar vendas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🎯 Fetch inicial
  useEffect(() => {
    fetchVendas();
  }, [userId]);

  // 🔥 POLLING INTELIGENTE baseado no ROLE
  useEffect(() => {
    if (!userId) return;

    if (isAdmin) {
      // 👑 ADMIN/SUPERVISOR: Polling moderado
      console.log('👑 [ListaVendas] Modo Admin - Polling moderado');
      
      // Primeiros 30s: a cada 15s
      const fastInterval = setInterval(fetchVendas, 15000);
      
      const slowTimeout = setTimeout(() => {
        clearInterval(fastInterval);
        // Depois: a cada 60s
        const slowInterval = setInterval(fetchVendas, 60000);
        return () => clearInterval(slowInterval);
      }, 30000);

      return () => {
        clearInterval(fastInterval);
        clearTimeout(slowTimeout);
      };
    } else {
      // 👤 OPERADOR/VENDEDOR: SEM polling agressivo
      console.log('👤 [ListaVendas] Modo Operador - Evento + checks pontuais');
      
      // Polling leve: a cada 30s apenas
      const interval = setInterval(fetchVendas, 30000);
      return () => clearInterval(interval);
    }
  }, [userId, isAdmin]);

  // 🎧 EVENT LISTENER: Para operadores (atualização instantânea)
  useEffect(() => {
    if (isAdmin) return; // Admin não precisa disto

    const handleVendaCreated = () => {
      console.log('🎉 [ListaVendas] Nova venda detectada! Atualizando AGORA...');
      
      // ⚡ Atualização INSTANTÂNEA
      fetchVendas();
      
      // 🔄 Revalidação após 5s (garantir que BD commitou)
      setTimeout(() => {
        console.log('🔄 [ListaVendas] Revalidação +5s...');
        fetchVendas();
      }, 5000);
    };

    window.addEventListener('vendaCreated', handleVendaCreated);

    return () => {
      window.removeEventListener('vendaCreated', handleVendaCreated);
    };
  }, [userId, isAdmin]);

  // 👀 Detecta quando tab fica visível
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👀 [ListaVendas] Tab visível - Atualizando...');
        fetchVendas();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId]);

  // 📅 Formatar data e hora
  const formatDateTime = (date: Date) => {
    const d = new Date(date);
    const time = d.toLocaleTimeString('pt-PT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const dateStr = d.toLocaleDateString('pt-PT', { 
      day: '2-digit', 
      month: '2-digit'
    });
    return `${time} • ${dateStr}`;
  };

  // 🎨 Loading state
  if (isLoading) {
    return (
      <div className='bg-white p-4 rounded-lg text-black'>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-bold">Vendas</h1>
        </div>
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-md animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white p-4 rounded-lg text-black'>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold">Vendas</h1>
        <button
          onClick={fetchVendas}
          className="text-xs text-gray-600 hover:text-purple-600 hover:underline cursor-pointer transition-colors"
          title="Atualizar lista"
        >
          🔄 Atualizar
        </button>
      </div>

      {/* Lista de Vendas */}
      <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
        {vendas.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            Nenhuma venda registada
          </div>
        ) : (
          vendas.map((venda, index) => (
            <div 
              key={venda.id}
              className={`flex flex-col rounded-md transition-all hover:shadow-md cursor-pointer animate-fadeIn ${
                index % 2 === 0 ? 'bg-gray-300' : 'bg-white border border-gray-200'
              }`}
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              {/* Header: ID da Venda + Data/Hora */}
              <div className="p-4 flex items-center justify-between">
                <h1 className="font-semibold text-gray-800 text-sm">
                  {venda.event_id}
                </h1>
                <span className="text-xs text-gray-600 whitespace-nowrap">
                  {formatDateTime(venda.created_at)}
                </span>
              </div>
              
              {/* Nome do Cliente */}
              <p className="px-4 pb-3 text-sm text-gray-700 font-medium">
                {venda.clientName}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Indicador de modo */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">
          {isAdmin
            ? '👑 Modo Admin - Atualização contínua'
            : '⚡ Modo Rápido - Atualização instantânea'}
        </p>
      </div>
    </div>
  );
};

export default ListaVendas;
