import React, { useState } from 'react';
import { Icons } from './Icons';
import { supabase, getRedirectUrl } from '../utils/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { SF_UI } from '../utils/ui-system';

interface AuthOnboardingProps {
  onComplete: (dontShowAgain: boolean) => void;
  onLoginSuccess: () => void;
}

export const AuthOnboarding: React.FC<AuthOnboardingProps> = ({ onComplete, onLoginSuccess }) => {
  const [step, setStep] = useState<'welcome' | 'warning'>('welcome');
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (provider: 'google' | 'apple') => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: getRedirectUrl()
      }
    });

    console.log("🔗 [Auth] Redirecionando para:", getRedirectUrl());

    if (error) {
       console.error(`Erro ao entrar com ${provider}:`, error.message);
       setLoading(false);
    } else {
       onLoginSuccess();
    }
  };

  return (
    <div className={`${SF_UI.effects.overlay}`}>
      <AnimatePresence mode="wait">
        {step === 'welcome' ? (
          <motion.div 
            key="welcome"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -30 }}
            className={`${SF_UI.layout.modal} ${SF_UI.effects.glowPrimary}`}
          >
            {/* Header Style */}
            <div className="w-full flex items-center gap-4">
              <div className={`w-12 h-12 ${SF_UI.rounding.inner} bg-white/5 border border-white/10 flex items-center justify-center text-[var(--theme-primary)]`}>
                <Icons.User className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className={`${SF_UI.typography.label}`}>CONTA GLOBAL</span>
                <h1 className={`${SF_UI.typography.h1}`}>CENTRAL DO JOGADOR</h1>
              </div>
            </div>

            <div className="flex flex-col items-center gap-8 py-4">
              <div className="relative">
                <div className={`w-28 h-28 ${SF_UI.rounding.modal} bg-[var(--theme-primary)]/5 border border-[var(--theme-primary)]/10 flex items-center justify-center ${SF_UI.effects.glowPrimary}`}>
                  <Icons.User className="w-12 h-12 text-[var(--theme-primary)]" />
                </div>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className={`absolute inset-0 border border-dashed border-[var(--theme-primary)]/20 ${SF_UI.rounding.modal} -m-4`}
                />
              </div>
              
              <div className="text-center space-y-3">
                <p className={`${SF_UI.typography.caption} leading-relaxed normal-case text-white/60 mx-auto max-w-[280px] text-center`}>
                  Crie sua conta global para registrar seus recordes no ranking mundial e nunca perder seu progresso.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleLogin('google')}
                disabled={loading}
                className={`${SF_UI.button.primary}`}
              >
                CONECTAR VIA GOOGLE
              </button>
              
              <button
                onClick={() => setStep('warning')}
                disabled={loading}
                className={`${SF_UI.button.secondary}`}
              >
                Ignorar e Jogar Offline
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="warning"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`${SF_UI.layout.modal} ${SF_UI.effects.glowDanger}`}
          >
             <div className="w-full flex items-center gap-4">
              <div className={`w-12 h-12 ${SF_UI.rounding.inner} bg-red/5 border border-red/10 flex items-center justify-center text-red`}>
                <Icons.Warning className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[0.6rem] font-black tracking-[0.3em] uppercase text-red opacity-60">ALERTA</span>
                <h1 className="text-xl font-black uppercase tracking-tighter text-red">MODO OFFLINE</h1>
              </div>
            </div>

            <div className={`bg-red/5 border border-red/10 ${SF_UI.rounding.card} p-8 space-y-4 ${SF_UI.effects.glowDanger} border-dashed`}>
              <p className="text-white/60 text-[0.75rem] font-bold uppercase leading-relaxed tracking-wider text-center">
                Dados salvos localmente podem ser perdidos se o cache do sistema for purgado.
              </p>
              <div className="flex items-center justify-center gap-4 text-[var(--theme-accent)] font-black text-[0.6rem] uppercase tracking-[0.3em] text-center leading-relaxed">
                 <Icons.Upgrades className="w-4 h-4" />
                 Ranking Desabilitado
              </div>
            </div>

            <div className="space-y-8">
              <label className="flex items-center justify-center gap-4 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="hidden"
                />
                <div className={`w-6 h-6 ${SF_UI.rounding.inner} border-2 transition-all flex items-center justify-center
                                ${dontShowAgain ? 'bg-red border-red' : 'border-white/10 bg-white/5'}`}>
                  {dontShowAgain && <Icons.Back className="w-4 h-4 text-white rotate-270" />}
                </div>
                <span className="text-white/30 text-[0.65rem] font-black uppercase tracking-[0.2em] group-hover:text-white/60 transition-all">
                  Não avisar novamente
                </span>
              </label>

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => onComplete(dontShowAgain)}
                  className={`${SF_UI.button.danger} !py-6 !text-xs !tracking-[0.4em]`}
                >
                  Confirmar Backup Local
                </button>
                <button
                  onClick={() => setStep('welcome')}
                  className={`${SF_UI.button.secondary}`}
                >
                  Retornar ao Login
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
