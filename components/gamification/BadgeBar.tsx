"use client"

import React, { useState } from 'react';
import CustomBadge from './CustomBadge';
import BadgeModal from './BadgeModal';
import { useBadges } from '@/hooks/useBadges';

const BadgeBar = () => {
  const { stats, isLoading } = useBadges();
  const [showModal, setShowModal] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-start gap-2 pt-1">
        <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse" />
        <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse" />
      </div>
    );
  }

  // 🥇 Determinar variante do ShieldBadge
  const shieldVariant = 
    stats.badges.dailyBadge === 'gold' ? 'gold' :
    stats.badges.dailyBadge === 'silver' ? 'silver' :
    'bronze';

  // 📊 Determinar qual medalha mostrar (1ª, 2ª ou 3ª venda)
  const medalNumber = Math.min(stats.salesToday, 3); // Máximo 3

  // 🎨 Tooltips
  const shieldTooltip = 
    stats.salesToday === 0 ? 'Nenhuma venda hoje' :
    stats.salesToday === 1 ? '🥉 1ª venda do dia!' :
    stats.salesToday === 2 ? '🥈 2ª venda do dia!' :
    '🥇 3ª venda do dia!';

  const starTooltip = `${stats.salesToday} vendas hoje`;

  return (
    <>
      {/* DESKTOP: Mostrar ambos os badges */}
      <div className="hidden lg:flex items-start gap-3 pt-1">
        {/* 🛡️ ShieldBadge - Medalha do dia (1ª, 2ª, 3ª) */}
        {stats.salesToday > 0 && (
          <CustomBadge
            type="shield"
            value={medalNumber}
            variant={shieldVariant}
            size={80}
            tooltip={shieldTooltip}
          />
        )}

        {/* ⭐ StarBadge - Número de vendas do dia */}
        <CustomBadge
          type="star"
          value={stats.salesToday}
          size={80}
          tooltip={starTooltip}
        />
      </div>

      {/* MOBILE: Só StarBadge + click para modal */}
      <div className="flex lg:hidden items-start pt-1">
        <button onClick={() => setShowModal(true)}>
          <CustomBadge
            type="star"
            value={stats.salesToday}
            size={60}
            tooltip="Ver todas as estatísticas"
          />
        </button>
      </div>

      {/* Modal com todos os badges (mobile) */}
      {showModal && (
        <BadgeModal 
          stats={stats} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </>
  );
};

export default BadgeBar;
