import React, { useMemo } from 'react';
import { SF_UI } from '../utils/ui-system';

interface FuryBarProps {
  progress: number; // 0 to 100
  isActive: boolean;
  mode?: string;
  theme: 'neon' | 'gameboy' | 'nokia' | 'universe' | 'sky';
}

export const FuryBar: React.FC<FuryBarProps> = ({ progress, isActive, mode, theme }) => {
  const isRetro = theme === 'nokia' || theme === 'gameboy';
  
  const barColor = useMemo(() => {
    if (isActive) return '#FF003C'; // Red fury
    if (progress >= 100) return '#FF8200'; // Ready
    return '#FFC800'; // Charging
  }, [isActive, progress]);

  if (isRetro && theme === 'nokia') {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="text-[10px] font-bold uppercase" style={{ color: '#0f380f' }}>
          {isActive ? `FÚRIA: ${mode}` : 'FÚRIA'}
        </div>
        <div className="w-[100px] h-3 border-2 border-[#0f380f] p-[1px]">
          <div 
            className="h-full bg-[#0f380f]" 
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5 group">
      <div 
        className={`${SF_UI.typography.label} !text-[0.5rem] transition-all duration-300 
                   ${isActive ? 'animate-pulse text-red shadow-[0_0_8px_red]' : 'opacity-40 group-hover:opacity-100'}`}
      >
        {isActive ? `MODO ${mode}` : 'MEDIDOR DE FÚRIA'}
      </div>
      
      <div className={`relative w-40 h-3 bg-black/40 ${SF_UI.rounding.full} overflow-hidden border border-white/5 backdrop-blur-3xl shadow-2xl`}>
        {/* Fill */}
        <div 
          className="h-full transition-all duration-500 ease-out relative"
          style={{ 
            width: `${Math.min(100, progress)}%`,
            backgroundColor: barColor,
            boxShadow: isActive ? '0 0 20px #FF003C' : progress >= 100 ? '0 0 12px #FF8200' : 'none'
          }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </div>
        {/* Holographic grid */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_91%,rgba(255,255,255,0.03)_91%)] bg-[length:8%_100%] pointer-events-none" />
      </div>
    </div>
  );
};
