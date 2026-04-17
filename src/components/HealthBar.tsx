import React from 'react';

interface HealthBarProps {
  current: number;
  max: number;
  theme: 'neon' | 'gameboy' | 'nokia' | 'universe' | 'sky';
}

export const HealthBar: React.FC<HealthBarProps> = ({ current, max, theme }) => {
  const isRetro = theme === 'nokia' || theme === 'gameboy';
  const percent = (current / max) * 100;
  
  if (isRetro && theme === 'nokia') {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="text-[10px] font-bold uppercase" style={{ color: '#0f380f' }}>HP {current}/{max}</div>
        <div className="w-[100px] h-3 border-2 border-[#0f380f] p-[1px]">
          <div 
            className="h-full bg-[#0f380f]" 
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-[10px] font-black tracking-widest text-white/50 uppercase">SAÚDE</div>
      <div className="relative w-32 h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/10 backdrop-blur-sm shadow-inner">
        <div 
          className="h-full hp-gradient transition-all duration-300 ease-out shadow-[0_0_10px_rgba(34,197,94,0.3)]"
          style={{ width: `${percent}%` }}
        />
        {/* Subtle grid on the bar */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_90%,rgba(0,0,0,0.2)_90%)] bg-[length:10%_100%]" />
      </div>
    </div>
  );
};
