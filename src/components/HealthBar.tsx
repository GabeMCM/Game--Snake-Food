import React from 'react';
import { SF_UI } from '../utils/ui-system';

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
    <div className="flex flex-col items-center gap-1.5 group">
      <div className={`${SF_UI.typography.label} !text-[0.5rem] !opacity-40 group-hover:opacity-100 transition-opacity`}>PROTOCOLO-VITA</div>
      <div className={`relative w-40 h-3 bg-black/40 ${SF_UI.rounding.full} overflow-hidden border border-white/5 backdrop-blur-3xl shadow-2xl`}>
        <div 
          className="h-full hp-gradient transition-all duration-500 ease-out shadow-[0_0_15px_rgba(34,197,94,0.4)]"
          style={{ width: `${percent}%` }}
        />
        {/* Subtle holographic grid */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_91%,rgba(255,255,255,0.03)_91%)] bg-[length:8%_100%] pointer-events-none" />
      </div>
    </div>
  );
};
