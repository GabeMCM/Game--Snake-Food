import React from 'react';
import { Icons } from './Icons';
import { supabase, getRedirectUrl } from '../utils/supabase';
import { motion } from 'framer-motion';
import { SF_UI } from '../utils/ui-system';

interface LoginModalProps {
  onBack: () => void;
  onLoginSuccess: () => void;
  isAuthenticated: boolean;
  userNickname?: string;
  userEmail?: string;
  avatarUrl?: string;
  coins: number;
  level: number;
  bestTime: number;
  onLogout: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ 
  onBack, onLoginSuccess, isAuthenticated, userNickname, userEmail, avatarUrl, coins, level, bestTime, onLogout 
}) => {
  const handleLogin = async (provider: 'google' | 'apple') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: getRedirectUrl()
      }
    });

    console.log("🔗 [Auth] Redirecionando para:", getRedirectUrl());

    if (error) {
      console.error(`Erro ao entrar com ${provider}:`, error.message);
    } else {
      onLoginSuccess();
    }
  };

  const renderAvatar = () => {
    if (!avatarUrl) return <Icons.User className="w-12 h-12 text-[var(--theme-primary)] opacity-40" />;
    
    if (avatarUrl.startsWith('http')) {
      return (
        <img 
          src={avatarUrl} 
          alt={userNickname} 
          className={`w-full h-full object-cover ${SF_UI.rounding.avatar}`}
        />
      );
    }

    return <span className="text-4xl">{avatarUrl}</span>;
  };

  return (
    <div className={`${SF_UI.effects.overlay}`}>
      <motion.div 
        initial={{ scale: 0.95, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        className={`${SF_UI.layout.modal} ${SF_UI.effects.glowPrimary}`}
      >
        
        {/* Header */}
        <div className="w-full flex items-center gap-4">
          <button 
            onClick={onBack}
            className={`${SF_UI.button.back}`}
          >
            <Icons.Back className="w-5 h-5 text-[var(--theme-text)] opacity-40" />
          </button>
          <div className="flex flex-col">
            <span className={`${SF_UI.typography.label}`}>PERFIL GLOBAL</span>
            <h1 className={`${SF_UI.typography.h1}`}>
              {isAuthenticated ? 'CONTA' : 'ACESSAR CONTA'}
            </h1>
          </div>
        </div>

        {isAuthenticated ? (
          <div className="flex flex-col gap-8 w-full">
             
             {/* Perfil Header */}
             <div className={`${SF_UI.layout.card} !p-6 relative group`}>
                <div className={`${SF_UI.profile.avatarContainer} cursor-pointer group/avatar`}
                     onClick={() => onLoginSuccess()}
                >
                   <div className={`w-full h-full ${SF_UI.rounding.avatar} bg-black/20 flex items-center justify-center overflow-hidden`}>
                     {renderAvatar()}
                   </div>
                   <div className={`${SF_UI.profile.avatarBadge}`}>
                     {level}
                   </div>
                   <div className={`absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center ${SF_UI.rounding.avatar}`}>
                      <Icons.Upgrades className="w-6 h-6 text-white" />
                   </div>
                </div>

                <div className="flex flex-col gap-1">
                   <h3 className={`${SF_UI.typography.h2}`}>{userNickname}</h3>
                   <span className={`${SF_UI.typography.caption} tracking-widest`}>{userEmail}</span>
                </div>
             </div>

             {/* Stats Grid */}
             <div className={`${SF_UI.layout.section}`}>
                <h3 className={`${SF_UI.typography.sectionTitle} text-[var(--theme-primary)]`}>ESTATÍSTICAS VINCULADAS</h3>
                <div className={`${SF_UI.layout.grid2}`}>
                   <div className={`${SF_UI.layout.card}`}>
                      <div className={`w-10 h-10 ${SF_UI.rounding.inner} bg-white/5 flex items-center justify-center`}>
                         <Icons.Coin className="w-5 h-5 text-[var(--theme-accent)]" />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[var(--theme-text)] font-black text-md">{coins}</span>
                         <span className={`${SF_UI.typography.caption}`}>CAPITAL</span>
                      </div>
                   </div>
                   <div className={`${SF_UI.layout.card}`}>
                      <div className={`w-10 h-10 ${SF_UI.rounding.inner} bg-white/5 flex items-center justify-center`}>
                         <Icons.Trophy className="w-5 h-5 text-[var(--theme-primary)]" />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[var(--theme-text)] font-black text-md">{bestTime.toFixed(1)}s</span>
                         <span className={`${SF_UI.typography.caption}`}>RECORDE</span>
                      </div>
                   </div>
                </div>
             </div>
             
             <div className="flex flex-col gap-4 mt-2">
                <button
                  onClick={onLogout}
                  className={`${SF_UI.button.danger}`}
                >
                  DESCONECTAR IDENTIDADE
                </button>

                <div className="flex items-center justify-center gap-3 py-2 text-[var(--theme-secondary)] opacity-60">
                   <div className={`w-1.5 h-1.5 ${SF_UI.rounding.full} bg-[var(--theme-secondary)] animate-pulse shadow-[0_0_8px_var(--theme-secondary)]`} />
                   <span className={`${SF_UI.typography.caption} tracking-[0.3em]`}>Status: Sincronizado</span>
                </div>
             </div>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            <div className={`${SF_UI.layout.section} text-center px-4`}>
              <p className={`${SF_UI.typography.caption} leading-relaxed normal-case text-white/60 text-center mx-auto max-w-[280px]`}>
                Conecte-se para aparecer no ranking mundial, ganhar moedas exclusivas e salvar seu progresso.
              </p>
              
              <div className={`bg-red/5 border border-red/10 ${SF_UI.rounding.card} p-6 mt-2 ${SF_UI.effects.glowDanger} border-dashed`}>
                <span className="text-red font-black text-[0.6rem] uppercase tracking-widest block mb-1">AVISO DE SOBREPOSIÇÃO</span>
                <p className="text-white/20 text-[0.55rem] font-bold uppercase leading-relaxed m-0 text-center">
                  Ao logar, os dados deste dispositivo serão substituídos pelos dados da sua conta de nuvem.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleLogin('google')}
                className={`${SF_UI.button.primary} flex items-center justify-center gap-4`}
              >
                <Icons.User className="w-5 h-5" />
                CONECTAR VIA GOOGLE
              </button>
              
              <button
                onClick={onBack}
                className={`${SF_UI.button.secondary}`}
              >
                IGNORAR E JOGAR OFFLINE
              </button>
            </div>

            <p className="text-[0.4rem] text-white/5 font-black text-center uppercase tracking-[0.6em]">
              SF-CORE-NETWORK V2.3.1
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
