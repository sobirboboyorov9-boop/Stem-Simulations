import React from 'react';

interface StemLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  subtext?: string;
}

export const StemLogo: React.FC<StemLogoProps> = ({
  size = 'md',
  showText = false,
  className = '',
  subtext = 'STEM PLATFORM'
}) => {
  const sizeMap = {
    sm: { box: 'size-7', icon: 'size-5', text: 'text-sm', sub: 'text-[9px]' },
    md: { box: 'size-9', icon: 'size-6', text: 'text-base', sub: 'text-[10px]' },
    lg: { box: 'size-12', icon: 'size-8', text: 'text-xl', sub: 'text-xs' },
    xl: { box: 'size-16', icon: 'size-11', text: 'text-2xl', sub: 'text-sm' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Dynamic Quantum Atom Emblem */}
      <div className={`relative flex ${currentSize.box} items-center justify-center rounded-xl bg-slate-900 border border-slate-700/80 shadow-md overflow-hidden group-hover:border-emerald-500/50 transition-all duration-300`}>
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-sky-500/15 to-indigo-500/25 opacity-70 group-hover:opacity-100 transition-opacity" />
        
        {/* SVG Orbital Logo */}
        <svg 
          viewBox="0 0 48 48" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={`${currentSize.icon} relative z-10`}
        >
          <defs>
            <linearGradient id="nucleusGradient" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="orbitGrad1" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <linearGradient id="orbitGrad2" x1="44" y1="4" x2="4" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>

          {/* Background constellation circle */}
          <circle cx="24" cy="24" r="19" stroke="#334155" strokeWidth="0.75" strokeDasharray="2 3" opacity="0.6" />

          {/* Tilted Ring 1 */}
          <g transform="rotate(35 24 24)">
            <ellipse cx="24" cy="24" rx="17" ry="6.5" stroke="url(#orbitGrad1)" strokeWidth="1.75" fill="none" opacity="0.85" />
            <circle cx="41" cy="24" r="2.2" fill="#34d399" />
            <circle cx="7" cy="24" r="1.6" fill="#38bdf8" />
          </g>

          {/* Tilted Ring 2 */}
          <g transform="rotate(-35 24 24)">
            <ellipse cx="24" cy="24" rx="17" ry="6.5" stroke="url(#orbitGrad2)" strokeWidth="1.75" fill="none" opacity="0.85" />
            <circle cx="41" cy="24" r="2.2" fill="#fbbf24" />
            <circle cx="7" cy="24" r="1.6" fill="#c084fc" />
          </g>

          {/* Quantum Nucleus */}
          <circle cx="24" cy="24" r="5.5" fill="url(#nucleusGradient)" />
          <circle cx="22.5" cy="22.5" r="1.8" fill="#ffffff" opacity="0.9" />
          <circle cx="25.5" cy="25.5" r="1.1" fill="#a7f3d0" opacity="0.8" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col text-left">
          <span className={`font-display ${currentSize.text} font-black tracking-tight text-foreground leading-none flex items-center gap-0.5`}>
            <span>STEM</span>
            <span className="text-primary font-bold">-</span>
            <span className="text-primary">Simulations</span>
          </span>
          <span className={`${currentSize.sub} font-bold text-muted-foreground tracking-widest uppercase mt-0.5`}>
            {subtext}
          </span>
        </div>
      )}
    </div>
  );
};
