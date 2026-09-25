import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

interface InfoTechLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  className?: string;
  customLogoUrl?: string;
  badgeStyle?: 'glow' | 'badge' | 'minimal';
  onClick?: () => void;
  interactive?: boolean;
}

export const InfoTechLogo: React.FC<InfoTechLogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '',
  customLogoUrl,
  badgeStyle,
  onClick,
  interactive = false
}) => {
  let appSettings: any = null;
  try {
    const app = useApp();
    appSettings = app?.settings;
  } catch {
    // Graceful fallback if rendered outside of AppProvider
  }

  const effectiveLogoUrl = customLogoUrl !== undefined 
    ? customLogoUrl 
    : appSettings?.logoUrl;
    
  const effectiveBadgeStyle = badgeStyle || appSettings?.logoBadgeStyle || 'glow';
  const storeNameAr = appSettings?.storeNameAr || 'أنفوتيك لتكنولوجيا الحواسيب';
  const storeName = appSettings?.storeName || 'InfoTech Computer Systems';

  const [imgError, setImgError] = useState(false);

  const sizeDimensions = {
    sm: { container: 'w-8 h-8 rounded-lg', img: 'max-h-7 max-w-7', iconSize: 20 },
    md: { container: 'w-11 h-11 rounded-xl', img: 'max-h-9 max-w-9', iconSize: 28 },
    lg: { container: 'w-14 h-14 rounded-2xl', img: 'max-h-12 max-w-12', iconSize: 36 },
    xl: { container: 'w-20 h-20 rounded-2xl', img: 'max-h-16 max-w-16', iconSize: 52 },
    '2xl': { container: 'w-28 h-28 rounded-3xl', img: 'max-h-24 max-w-24', iconSize: 72 }
  };

  const dim = sizeDimensions[size] || sizeDimensions.md;

  // Visual styling based on badgeStyle
  let borderAndGlowClasses = '';
  if (effectiveBadgeStyle === 'glow') {
    borderAndGlowClasses = 'border-2 border-cyan-400/60 shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-500/20';
  } else if (effectiveBadgeStyle === 'badge') {
    borderAndGlowClasses = 'border-2 border-amber-400/60 shadow-lg shadow-amber-500/20 ring-2 ring-amber-500/20';
  } else {
    borderAndGlowClasses = 'border border-slate-700/80 shadow-md shadow-black/40';
  }

  const hasValidCustomLogo = Boolean(effectiveLogoUrl && effectiveLogoUrl.trim() !== '' && !imgError);

  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 select-none ${interactive || onClick ? 'cursor-pointer group' : ''} ${className}`}
      title={interactive || onClick ? 'شعار المتجر (اضغط لتعديل الإعدادات واللوغو)' : undefined}
    >
      {/* Prominent High-Tech Logo Container */}
      <div className={`relative ${dim.container} shrink-0 flex items-center justify-center transition-all duration-300 ${interactive || onClick ? 'group-hover:scale-105' : ''}`}>
        {/* Ambient Backlight Glow Effect */}
        <div className={`absolute inset-0 rounded-2xl blur-md pointer-events-none transition-opacity ${
          effectiveBadgeStyle === 'badge'
            ? 'bg-gradient-to-tr from-amber-500/40 via-orange-500/30 to-yellow-500/40 opacity-80 group-hover:opacity-100'
            : 'bg-gradient-to-tr from-cyan-500/40 via-blue-600/30 to-teal-400/40 opacity-80 group-hover:opacity-100'
        }`} />

        {/* Main Emblem / Badge Shell */}
        <div className={`relative w-full h-full rounded-2xl bg-gradient-to-br from-[#0F1A30] via-[#0B1527] to-[#070D18] ${borderAndGlowClasses} flex items-center justify-center overflow-hidden p-1.5 backdrop-blur-md`}>
          {/* Subtle Circuit Grid Overlay */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:6px_6px] pointer-events-none" />

          {/* Conditional Rendering: Custom Logo Image OR Default SVG Logo */}
          {hasValidCustomLogo ? (
            <img 
              src={effectiveLogoUrl} 
              alt={storeNameAr} 
              onError={() => setImgError(true)}
              className={`w-full h-full object-contain filter drop-shadow-md relative z-10 transition-transform ${interactive || onClick ? 'group-hover:scale-110' : ''}`}
            />
          ) : (
            /* Default High-Tech SVG Badge */
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10">
              {/* Monitor Outer Shell */}
              <rect x="5" y="6" width="30" height="22" rx="3.5" stroke="url(#cyanBlueGrad)" strokeWidth="2.2" fill="#070D18" />
              
              {/* Stand Base */}
              <path d="M16 28L14 34H26L24 28" stroke="url(#cyanBlueGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              
              {/* Screen Inner Bezel */}
              <rect x="8" y="9" width="24" height="16" rx="2" fill="url(#screenGrad)" />
              
              {/* Stylized "i" */}
              <circle cx="16" cy="13.5" r="1.6" fill="#38BDF8" />
              <rect x="15" y="16.5" width="2.2" height="6.5" rx="1" fill="#38BDF8" />
              
              {/* Stylized "T" */}
              <path d="M20.5 14.5H26.5M23.5 14.5V23" stroke="#22D3EE" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              
              {/* Glowing Tech Circuit Nodes */}
              <circle cx="31" cy="9" r="1.6" fill="#F59E0B" />
              <circle cx="9" cy="24" r="1.3" fill="#10B981" />

              {/* Gradients */}
              <defs>
                <linearGradient id="cyanBlueGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00F2FE" />
                  <stop offset="1" stopColor="#2563EB" />
                </linearGradient>
                <linearGradient id="screenGrad" x1="8" y1="9" x2="32" y2="25" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0F1F38" />
                  <stop offset="1" stopColor="#070E1A" />
                </linearGradient>
              </defs>
            </svg>
          )}

          {/* Glowing Top-Right Lens Reflection */}
          <div className="absolute top-0 right-0 w-6 h-6 bg-white/10 rounded-bl-full pointer-events-none" />
        </div>
      </div>

      {showText && (
        <div className="flex flex-col text-start">
          <div className="flex items-center gap-1.5">
            <span className="font-black tracking-tight text-white text-base lg:text-lg drop-shadow-sm flex items-center gap-1">
              {hasValidCustomLogo ? (
                <span className="truncate max-w-[200px]">{storeNameAr}</span>
              ) : (
                <>
                  <span>Info</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
                    Tech
                  </span>
                </>
              )}
            </span>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10">
              ERP·POS
            </span>
          </div>
          <span className="text-[10px] text-slate-300 font-semibold tracking-tight truncate max-w-[220px]">
            {hasValidCustomLogo ? storeName : 'أنفوتيك للحواسيب والإلكترونيات'}
          </span>
        </div>
      )}
    </div>
  );
};
