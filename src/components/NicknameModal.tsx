import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { supabase } from '../utils/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { SF_UI } from '../utils/ui-system';

interface NicknameModalProps {
  userId: string;
  googleAvatarUrl?: string;
  onSuccess: (nickname: string, avatarUrl: string) => void;
}

const AVATAR_OPTIONS = [
  { id: 'snake', icon: '🐍', color: '#22c55e' },
  { id: 'apple', icon: '🍎', color: '#ff3c50' },
  { id: 'gold', icon: '💰', color: '#fbbf24' },
  { id: 'ghost', icon: '👻', color: '#94a3b8' },
  { id: 'star', icon: '⭐', color: '#facc15' },
  { id: 'zap', icon: '⚡', color: '#3b82f6' },
];

export const NicknameModal: React.FC<NicknameModalProps> = ({ userId, googleAvatarUrl, onSuccess }) => {
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(googleAvatarUrl || 'snake');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'available' | 'taken' | 'invalid'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (nickname.length < 3) {
      setStatus('idle');
      return;
    }

    if (/\s/.test(nickname)) {
      setStatus('invalid');
      setError('Espaços não são permitidos.');
      return;
    }

    const timer = setTimeout(async () => {
      setChecking(true);
      setError(null);
      
      try {
        const { data, error: checkError } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('nickname', nickname)
          .maybeSingle();

        if (checkError) {
          console.error("❌ [Auth] Erro na consulta de disponibilidade:", checkError);
          setStatus('idle');
          return;
        }

        if (data) {
          setStatus('taken');
          setError('Este nome já está em uso.');
        } else {
          setStatus('available');
          setError(null);
        }
      } catch (err) {
        console.error("❌ [Auth] Erro fatal na verificação:", err);
        setStatus('idle');
      } finally {
        setChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [nickname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || checking) return;
    if (status === 'taken' || status === 'invalid') return;

    setLoading(true);
    setError(null);

    const finalAvatar = AVATAR_OPTIONS.find(a => a.id === selectedAvatar)?.icon || selectedAvatar;

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({ 
          id: userId, 
          nickname,
          avatar_url: finalAvatar,
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;
      onSuccess(nickname, finalAvatar);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar perfil.');
      setLoading(false);
    }
  };

  return (
    <div className={`${SF_UI.effects.overlay}`}>
      <motion.div 
        initial={{ scale: 0.95, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        className={`${SF_UI.layout.modal} ${SF_UI.effects.glowPrimary}`}
      >
        {/* Header Style */}
        <div className="w-full flex items-center gap-4">
           <div className={`w-12 h-12 ${SF_UI.rounding.inner} bg-white/5 border border-white/10 flex items-center justify-center text-[var(--theme-primary)]`}>
              <Icons.User className="w-6 h-6" />
           </div>
           <div className="flex flex-col">
              <span className={`${SF_UI.typography.label}`}>REGISTRO GLOBAL</span>
              <h1 className={`${SF_UI.typography.h1}`}>CRIAR IDENTIDADE</h1>
           </div>
        </div>

        <div className={`${SF_UI.layout.section}`}>
           <h3 className={`${SF_UI.typography.sectionTitle} text-[var(--theme-primary)]`}>
             SINAL VISUAL
           </h3>
           <div className={`${SF_UI.avatar.list}`}>
              {googleAvatarUrl && (
                <button
                  type="button"
                  onClick={() => setSelectedAvatar(googleAvatarUrl)}
                  className={`${SF_UI.avatar.item} overflow-hidden
                             ${selectedAvatar === googleAvatarUrl ? 'border-[var(--theme-primary)] scale-110 shadow-lg' : 'border-transparent opacity-40'}`}
                >
                  <img src={googleAvatarUrl} alt="Google" className="w-full h-full object-cover" />
                </button>
              )}
              
              {AVATAR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedAvatar(opt.id)}
                  className={`${SF_UI.avatar.item} flex items-center justify-center text-2xl bg-white/5
                             ${selectedAvatar === opt.id ? 'border-[var(--theme-primary)] scale-110 shadow-lg' : 'border-transparent opacity-40'}`}
                  style={{ color: opt.color }}
                >
                  {opt.icon}
                </button>
              ))}
           </div>
        </div>

        <form onSubmit={handleSubmit} className={`${SF_UI.layout.section}`}>
          <h3 className={`${SF_UI.typography.sectionTitle} text-[var(--theme-primary)]`}>
             COGNOME NO RANKING
          </h3>
          <div className="relative group">
            <input
              autoFocus
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value.replace(/\s/g, ''))}
              placeholder="PLAYER_REFORGED"
              maxLength={16}
              className={`w-full bg-black/40 border-2 ${SF_UI.rounding.card} py-5 px-6 text-white text-center font-black text-xl tracking-[0.1em]
                         transition-all outline-none placeholder:text-white/10 uppercase
                         ${status === 'available' ? 'border-[var(--theme-secondary)] shadow-[0_0_15px_rgba(0,255,130,0.1)]' : status === 'taken' ? 'border-red/50' : 'border-white/5'}`}
            />
            {checking && (
              <div className={`absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-white/10 border-t-[var(--theme-primary)] ${SF_UI.rounding.full} animate-spin`} />
            )}
          </div>
          
          <div className="h-6 flex items-center justify-center">
            {error ? (
              <span className="text-red text-[0.65rem] font-black uppercase tracking-widest">{error}</span>
            ) : status === 'available' ? (
              <span className="text-[var(--theme-secondary)] text-[0.65rem] font-black uppercase tracking-widest">Identidade Disponível</span>
            ) : (
              <span className={`${SF_UI.typography.caption} text-center opacity-40`}>Sem Espaços • Mínimo 3 Caracteres</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || status !== 'available' || checking}
            className={`${SF_UI.button.primary} mt-4`}
          >
            {loading ? 'SINCRONIZANDO...' : 'FINALIZAR REGISTRO'}
          </button>
        </form>

        <p className={`${SF_UI.typography.caption} text-center opacity-10 border-t border-white/5 pt-6`}>
          CONFORME PROTOCOLO SF-NETWORK-V2
        </p>
      </motion.div>
    </div>
  );
};
