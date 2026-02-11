"use client"

import React from 'react';

interface BadgeDisplayProps {
  icon: string;
  value: number | string;
  variant: 'gold' | 'silver' | 'bronze' | 'purple' | 'fire' | 'neutral';
  tooltip?: string;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const BadgeDisplay = ({ 
  icon, 
  value, 
  variant, 
  tooltip, 
  size = 'md',
  animate = false 
}: BadgeDisplayProps) => {
  
  const variantStyles = {
    gold: 'bg-yellow-400/90 border-yellow-500 text-yellow-900 dark:bg-yellow-500 dark:border-yellow-400 dark:text-yellow-50',
    silver: 'bg-gray-300/90 border-gray-400 text-gray-800 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-50',
    bronze: 'bg-orange-400/90 border-orange-500 text-orange-900 dark:bg-orange-500 dark:border-orange-400 dark:text-orange-50',
    purple: 'bg-purple-500/90 border-purple-600 text-white dark:bg-purple-600 dark:border-purple-500',
    fire: 'bg-gradient-to-r from-orange-400 to-red-500 border-orange-600 text-white',
    neutral: 'bg-white/90 border-gray-400 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100',
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };

   return (
    <div 
      className={`
        flex items-center rounded-full border-2 font-bold
        transition-all duration-300 cursor-pointer
        hover:scale-105 hover:shadow-md
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${animate ? 'animate-bounce' : ''}
      `}
      title={tooltip}
    >
      <span className={size === 'sm' ? 'text-sm' : 'text-lg'}>{icon}</span>
      <span className="font-extrabold">{value}</span>
    </div>
  );
};

export default BadgeDisplay;