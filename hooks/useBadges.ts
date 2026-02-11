"use client"

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getUserStats } from "@/lib/actions/user.actions";

interface UserStats {
  salesToday: number;
  salesTotal: number;
  streak: number;
  level: 'iniciante' | 'bronze' | 'prata' | 'ouro' | 'diamante';
  badges: {
    dailyBadge: 'none' | 'bronze' | 'silver' | 'gold';
    hasMilestone: boolean;
  };
}

export const useBadges = () => {
  const { userId } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    salesToday: 0,
    salesTotal: 0,
    streak: 0,
    level: 'iniciante',
    badges: {
      dailyBadge: 'none',
      hasMilestone: false,
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        console.log('🔄 [useBadges] Buscando stats...');
        
        // 🔥 USAR SERVER ACTION (não API route!)
        const data = await getUserStats(userId);
        
        console.log('✅ [useBadges] Stats recebidas:', data);
        
        setStats({
          salesToday: data.salesToday || 0,
          salesTotal: data.salesTotal || 0,
          streak: data.streak || 0,
          level: calculateLevel(data.salesTotal || 0),
          badges: {
            dailyBadge: calculateDailyBadge(data.salesToday || 0),
            hasMilestone: checkMilestone(data.salesTotal || 0),
          }
        });
      } catch (error) {
        console.error('❌ [useBadges] Erro ao carregar stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();

    // 🔥 Event listener para atualizar quando venda é criada
    const handleVendaCreated = () => {
      console.log('🎉 [useBadges] Nova venda! Atualizando badges...');
      fetchStats();
    };

    window.addEventListener('vendaCreated', handleVendaCreated);
    return () => window.removeEventListener('vendaCreated', handleVendaCreated);

  }, [userId]);

  return { stats, isLoading };
};

// 🎯 Calcula nível baseado em vendas totais
function calculateLevel(total: number): 'iniciante' | 'bronze' | 'prata' | 'ouro' | 'diamante' {
  if (total >= 100) return 'diamante';
  if (total >= 50) return 'ouro';
  if (total >= 25) return 'prata';
  if (total >= 10) return 'bronze';
  return 'iniciante';
}

// 🥇 Calcula badge do dia
function calculateDailyBadge(today: number): 'none' | 'bronze' | 'silver' | 'gold' {
  if (today >= 3) return 'gold';
  if (today >= 2) return 'silver';
  if (today >= 1) return 'bronze';
  return 'none';
}

// 🎖️ Verifica se atingiu milestone
function checkMilestone(total: number): boolean {
  return [10, 25, 50, 100, 250, 500].includes(total);
}
