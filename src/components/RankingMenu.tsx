import React, { useEffect, useState } from 'react';
import { Icons } from './Icons';
import { supabase } from '../utils/supabase';
import { SF_UI } from '../utils/ui-system';

interface RankingEntry {
  id: string;
  nickname: string;
  best_time: number;
  level: number;
}

interface RankingMenuProps {
  onBack: () => void;
}

export const RankingMenu: React.FC<RankingMenuProps> = ({ onBack }) => {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<'TIME' | 'LEVEL'>('TIME');

  useEffect(() => {
    fetchRankings();
  }, [category]);

  const fetchRankings = async () => {
    setLoading(true);
    const orderBy = category === 'TIME' ? 'best_time' : 'level';
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nickname, best_time, level')
      .order(orderBy, { ascending: false })
      .limit(100);

    if (!error && data) {
      setRankings(data);
    }
    setLoading(false);
  };

  return (
    <div className={`${SF_UI.effects.overlay} !flex-col p-10 bg-[#0c0c12]`}>
      
      {/* ── HEADER ── */}
      <div className="w-full max-w-lg md:max-w-4xl mx-auto flex items-center justify-between gap-4 mb-10">
        <button 
          onClick={onBack}
          className={`${SF_UI.button.back}`}
        >
          <Icons.Back className="w-5 h-5 opacity-40" />
        </button>
        <div className="flex flex-col items-center">
          <h2 className={`${SF_UI.typography.label} !opacity-40`}>TABELA DE HONRA</h2>
          <h1 className={`${SF_UI.typography.h1}`}>RANKING GLOBAL</h1>
        </div>
        <button 
          onClick={fetchRankings}
          disabled={loading}
          className={`${SF_UI.button.secondary} !w-14 !h-14 !p-0 flex items-center justify-center disabled:opacity-20`}
        >
          <div className={`${loading ? 'animate-spin' : ''}`}>
             <Icons.Upgrades className="w-6 h-6 rotate-180" />
          </div>
        </button>
      </div>

      {/* ── CATEGORY SWITCHER ── */}
      <div className={`w-full max-w-sm mx-auto flex bg-black/40 ${SF_UI.rounding.modal} p-2 mb-10 border border-white/5`}>
        <button
          onClick={() => setCategory('TIME')}
          className={`flex-1 py-3 ${SF_UI.rounding.button} text-[0.65rem] font-black tracking-widest transition-all
                     ${category === 'TIME' ? 'bg-white text-black shadow-xl shadow-white/10' : 'text-white/40 hover:text-white/60'}`}
        >
          MAIOR TEMPO
        </button>
        <button
          onClick={() => setCategory('LEVEL')}
          className={`flex-1 py-3 ${SF_UI.rounding.button} text-[0.65rem] font-black tracking-widest transition-all
                     ${category === 'LEVEL' ? 'bg-white text-black shadow-xl shadow-white/10' : 'text-white/40 hover:text-white/60'}`}
        >
          GRAU ATLETA
        </button>
      </div>

      {/* ── LIST ── */}
      <div className="flex-1 w-full max-w-lg md:max-w-4xl mx-auto overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-6 py-20">
             <div className="w-12 h-12 border-4 border-white/5 border-t-[var(--theme-primary)] rounded-full animate-spin" />
             <span className="text-[0.6rem] font-black text-white/20 uppercase tracking-[0.5em]">Sincronizando Protocolos...</span>
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-20 opacity-20">
             <Icons.Warning className="w-16 h-16 mx-auto mb-6" />
             <p className="text-sm font-black uppercase tracking-[0.3em]">Nenhum registro no setor.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-20">
            {rankings.map((entry, index) => {
              const isTop3 = index < 3;
              const medalColor = index === 0 ? 'text-gold' : index === 1 ? 'text-gray-400' : 'text-amber-600';

              return (
                <div 
                  key={entry.id}
                  className={`${SF_UI.layout.card} !p-6 justify-between transition-all hover:translate-x-1
                             ${isTop3 ? `${SF_UI.effects.glowPrimary} !bg-white/5 border-none` : 'bg-black/20 border-white/5 opacity-60'}`}
                >
                  <div className="flex items-center gap-8">
                    <span className={`w-8 text-center text-xl font-black ${isTop3 ? 'text-[var(--theme-primary)]' : 'text-white/10'}`}>
                      {index + 1}
                    </span>
                    <div className="flex flex-col gap-1">
                      <span className={`${SF_UI.typography.body} !text-sm tracking-widest truncate max-w-[120px] sm:max-w-[200px]`}>
                        {entry.nickname}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[0.5rem] font-black text-[var(--theme-primary)] uppercase tracking-tight opacity-40">GR. {entry.level}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                      <span className="text-white text-xl font-black tracking-tighter tabular-nums">
                        {category === 'TIME' ? `${entry.best_time.toFixed(1)}s` : entry.level}
                      </span>
                    </div>
                    {isTop3 && (
                      <div className={`w-10 h-10 ${SF_UI.rounding.inner} bg-white/5 flex items-center justify-center`}>
                        <Icons.Trophy className={`w-6 h-6 ${medalColor} drop-shadow-[0_0_8px_currentColor]`} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="w-full max-w-lg md:max-w-4xl mx-auto pt-6 border-t border-white/5 flex justify-center">
         <p className="text-[0.5rem] font-black text-white/10 tracking-[0.6em] uppercase">SF-CORE-NETWORK V2.3.1 • RANKING-SETOR-A</p>
      </div>
    </div>

  );
};
