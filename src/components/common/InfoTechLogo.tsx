import React from 'react';

interface InfoTechLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const InfoTechLogo: React.FC<InfoTechLogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* High-tech Badge Logo inspired by InfoTech identity */}
      <div className={`relative ${sizeClasses[size]} shrink-0 flex items-center justify-center`}>
        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-cyan-500/30 to-blue-600/30 blur-sm transform scale-110" />
        
        {/* Main Badge Container */}
        <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A0F1D] border border-cyan-500/40 shadow-lg shadow-cyan-500/10 flex items-center justify-center overflow-hidden p-1">
          {/* Subtle Circuit Grid lines */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:6px_6px]" />
          
          {/* Logo SVG */}
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10">
            {/* Monitor Outer Shell */}
            <rect x="5" y="6" width="30" height="22" rx="3.5" stroke="url(#cyanBlueGrad)" strokeWidth="2" fill="#090E17" />
            
            {/* Stand Base */}
            <path d="M16 28L14 34H26L24 28" stroke="url(#cyanBlueGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Screen Inner Bezel */}
            <rect x="8" y="9" width="24" height="16" rx="2" fill="url(#screenGrad)" />
            
            {/* Stylized "i" */}
            <circle cx="16" cy="13.5" r="1.5" fill="#38BDF8" />
            <rect x="15" y="16.5" width="2" height="6.5" rx="1" fill="#38BDF8" />
            
            {/* Stylized "T" */}
            <path d="M20.5 14.5H26.5M23.5 14.5V23" stroke="#22D3EE" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Glowing Tech Circuit Node */}
            <circle cx="31" cy="9" r="1.5" fill="#F59E0B" />
            <circle cx="9" cy="24" r="1.2" fill="#10B981" />

            {/* Gradients */}
            <defs>
              <linearGradient id="cyanBlueGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00F2FE" />
                <stop offset="1" stopColor="#2563EB" />
              </linearGradient>
              <linearGradient id="screenGrad" x1="8" y1="9" x2="32" y2="25" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0E192D" />
                <stop offset="1" stopColor="#070D18" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col text-start">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight text-white text-base lg:text-lg">
              Info<span className="text-cyan-400">Tech</span>
            </span>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30">
              ERP·POS
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium tracking-tight">
            أنفوتيك للحواسيب والإلكترونيات
          </span>
        </div>
      )}
    </div>
  );
};
