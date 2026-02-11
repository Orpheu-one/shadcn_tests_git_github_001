"use client"

import React from 'react';
import Image from 'next/image';

interface CustomBadgeProps {
  type: 'shield' | 'star';
  value: number;
  variant?: 'bronze' | 'silver' | 'gold';
  size?: number;
  tooltip?: string;
}

const CustomBadge = ({ 
  type, 
  value, 
  variant = 'bronze',
  size = 80,
  tooltip 
}: CustomBadgeProps) => {
  
  // 🎨 Cores para o ShieldBadge (baseado na variante)
  const shieldColors = {
    bronze: '#CD7F32',  // Bronze
    silver: '#C0C0C0',  // Prata
    gold: '#FFD700',    // Ouro
  };

  // 🎨 Cor do texto (sempre branco para boa visibilidade)
  const textColor = '#FFFFFF';

  // 📏 Tamanho da fonte baseado no size do badge
  const fontSize = size * 0.35; // 35% do tamanho do badge

  return (
    <div 
      className="relative inline-block cursor-pointer transition-transform hover:scale-110"
      style={{ width: size, height: size }}
      title={tooltip}
    >
      {/* 🖼️ SVG de fundo */}
      <div className="absolute inset-0">
        <Image
          src={type === 'shield' ? '/ShieldBadge.svg' : '/StarBadge.svg'}
          alt={type === 'shield' ? 'Shield Badge' : 'Star Badge'}
          width={size}
          height={size}
          className="w-full h-full object-contain"
          priority
        />
      </div>

      {/* 🔢 Número no centro */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{
          paddingTop: type === 'shield' ? '8%' : '10%', // Ajuste fino para centrar
        }}
      >
        <span 
          className="font-extrabold"
          style={{
            color: textColor,
            fontSize: `${fontSize}px`,
            lineHeight: 1,
            textShadow: `
              -2px -2px 3px rgba(0,0,0,0.9),
              2px -2px 3px rgba(0,0,0,0.9),
              -2px 2px 3px rgba(0,0,0,0.9),
              2px 2px 3px rgba(0,0,0,0.9),
              0 0 6px rgba(0,0,0,1)
            `,
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
};

export default CustomBadge;
