import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';

export function Logo({ size = 'md', showText = true, className = '' }) {
  const { theme } = useTheme();

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Sleek Emblem */}
      <div className={`relative flex items-center justify-center ${iconSizes[size]} rounded-lg bg-[#141923] border border-amber-500/40 shadow-sm shrink-0`}>
        <svg viewBox="0 0 100 100" className="w-full h-full p-1.5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="80" height="80" rx="16" stroke="#D97706" strokeWidth="4" strokeOpacity="0.5" />
          <path d="M30 30 V70 H50" stroke="#F8FAFB" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M55 45 L70 30" stroke="#D97706" strokeWidth="6" strokeLinecap="round" />
          <circle cx="72" cy="28" r="7" fill="#10B981" />
          <circle cx="50" cy="65" r="5" fill="#D97706" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold tracking-tight leading-none text-white ${textSizes[size]}`}>
            {theme.brand_name || 'LWS Direct'}
          </span>
          <span className="text-[9px] font-medium tracking-wider uppercase text-amber-500/90 mt-1">
            Learn With Sami
          </span>
        </div>
      )}
    </div>
  );
}
