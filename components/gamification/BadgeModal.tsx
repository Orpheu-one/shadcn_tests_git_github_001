"use client"

import React from 'react';

interface BadgeModalProps {
  stats: {
    salesToday: number;
    salesTotal: number;
    streak: number;
    level: 'iniciante' | 'bronze' | 'prata' | 'ouro' | 'diamante';
    badges: {
      dailyBadge: 'none' | 'bronze' | 'silver' | 'gold';
      hasMilestone: boolean;
    };
  };
  onClose: () => void;
}

const BadgeModal = ({ stats, onClose }: BadgeModalProps) => {
  const levelIcons = {
    iniciante: '🌱',
    bronze: '🥉',
    prata: '🥈',
    ouro: '🥇',
    diamante: '💎',
  };

   return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Minhas Conquistas 🏆
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Vendas Hoje</span>
              <span className="text-3xl">
                {stats.badges.dailyBadge === 'gold' ? '🥇' : 
                 stats.badges.dailyBadge === 'silver' ? '🥈' : 
                 stats.badges.dailyBadge === 'bronze' ? '🥉' : '📊'}
              </span>
            </div>
            <p className="text-4xl font-extrabold text-yellow-600">
              {stats.salesToday}
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Nível</span>
              <span className="text-3xl">{levelIcons[stats.level]}</span>
            </div>
            <p className="text-2xl font-extrabold text-purple-600 capitalize">
              {stats.level}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {stats.salesTotal} vendas totais
            </p>
          </div>

          {stats.streak > 0 && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border-2 border-orange-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Sequência</span>
                <span className="text-3xl">🔥</span>
              </div>
              <p className="text-4xl font-extrabold text-orange-600">
                {stats.streak} dias
              </p>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Total Geral</span>
              <span className="text-3xl">📊</span>
            </div>
            <p className="text-4xl font-extrabold text-gray-700">
              {stats.salesTotal}
            </p>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            {stats.salesToday === 0 
              ? "Vamos começar o dia! 💪" 
              : stats.salesToday >= 3 
              ? "Está em fogo! 🔥🔥🔥"
              : "Continue assim! 🚀"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BadgeModal;