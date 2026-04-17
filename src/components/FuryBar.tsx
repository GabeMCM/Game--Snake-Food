import React, { useMemo } from 'react';

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
    <div className="flex flex-col items-center gap-1 group">
      <div 
        className={`text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${isActive ? 'animate-pulse text-red-500 scale-110' : 'text-white/50'}`}
        style={{ textShadow: isActive ? '0 0 10px rgba(255, 0, 60, 0.8)' : 'none' }}
      >
        {isActive ? `MODO ${mode}` : 'MEDIDOR DE FÚRIA'}
      </div>
      
      <div className="relative w-32 h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/10 backdrop-blur-sm">
        {/* Background glow when active */}
        {isActive && (
          <div className="absolute inset-0 bg-red-500/20 animate-pulse" />
        )}
        
        {/* Fill */}
        <div 
          className="h-full transition-all duration-300 ease-out relative"
          style={{ 
            width: `${Math.min(100, progress)}%`,
            backgroundColor: barColor,
            boxShadow: isActive ? '0 0 15px #FF003C' : progress >= 100 ? '0 0 10px #FF8200' : 'none'
          }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </div>
      </div>
    </div>
  );
};
