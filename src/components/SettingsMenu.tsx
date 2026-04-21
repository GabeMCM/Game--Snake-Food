import React from 'react'
import { Icons } from './Icons'
import { PlayerData } from '../utils/persistence'
import { APP_CONFIG } from '../utils/config'
import { SF_UI } from '../utils/ui-system'

interface SettingsMenuProps {
  settings: PlayerData['settings']
  onBack: () => void
  onToggleSetting: (key: keyof PlayerData['settings'], value: any) => void
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ settings, onBack, onToggleSetting }) => {
  return (
    <div className="animate-fade-in w-full h-full flex flex-col items-center p-10 overflow-y-auto custom-scrollbar bg-[#0c0c12]">
      
      {/* Header */}
      <div className="w-full max-w-lg md:max-w-4xl flex items-center gap-4 mb-10">
        <button 
          className={`${SF_UI.button.back}`} 
          onClick={onBack}
        >
          <Icons.Back className="w-5 h-5 opacity-40" />
        </button>
        <div className="flex flex-col">
          <h2 className={`${SF_UI.typography.label} !opacity-40`}>GESTÃO DE SISTEMA</h2>
          <h1 className={`${SF_UI.typography.h1}`}>PREFERÊNCIAS</h1>
        </div>
      </div>

      <div className="w-full max-w-lg md:max-w-4xl flex flex-col gap-10">
        
        {/* Accessibility Section */}
        <div className={`${SF_UI.layout.section}`}>
          <h3 className={`${SF_UI.typography.sectionTitle} text-[var(--theme-primary)]`}>ACESSIBILIDADE</h3>
          
          <div className={`${SF_UI.layout.card} !p-6 justify-between gap-8 ${SF_UI.effects.glowPrimary}`}>
            <div className="flex flex-col gap-2 flex-1">
              <span className={`${SF_UI.typography.body}`}>Desativar Flashing</span>
              <p className={`${SF_UI.typography.caption} normal-case leading-relaxed opacity-60`}>
                Substitui os flashes de alta frequência da Fúria por uma inversão de cores estática. Recomendado para pessoas com fotossensibilidade ou epilepsia.
              </p>
            </div>
            
            <button
              className={`relative w-16 h-10 ${SF_UI.rounding.full} transition-all duration-300 p-1 flex items-center border border-white/10
                ${settings.disableFlashing ? 'bg-[var(--theme-secondary)]' : 'bg-white/5'}`}
              onClick={() => onToggleSetting('disableFlashing', !settings.disableFlashing)}
            >
              <div 
                className={`w-8 h-8 ${SF_UI.rounding.full} bg-white shadow-xl transition-transform duration-300 transform
                  ${settings.disableFlashing ? 'translate-x-6' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </div>

        {/* Community & Support Section */}
        <div className={`${SF_UI.layout.section}`}>
          <h3 className={`${SF_UI.typography.sectionTitle} text-[var(--theme-accent)]`}>COMUNIDADE & APOIO</h3>
          
          <div className={`${SF_UI.layout.grid2}`}>
            <button 
              onClick={() => window.open(APP_CONFIG.COMMUNITY.FEEDBACK_FORM, '_blank')}
              className={`${SF_UI.layout.card} !p-6 flex-col text-center group`}
            >
              <div className={`w-14 h-14 ${SF_UI.rounding.card} bg-white/5 flex items-center justify-center text-[var(--theme-text)] group-hover:scale-110 transition-transform`}>
                <Icons.Help className="w-7 h-7" />
              </div>
              <div className="flex flex-col items-center gap-2 mt-2">
                <span className={`${SF_UI.typography.body}`}>Dar Opinião</span>
                <span className={`${SF_UI.typography.caption} opacity-40`}>Sugira melhorias</span>
              </div>
            </button>

            <button 
              onClick={() => window.open(APP_CONFIG.COMMUNITY.DONATION_LINK, '_blank')}
              className={`${SF_UI.layout.card} !p-6 flex-col text-center group ${SF_UI.effects.glowAccent}`}
            >
              <div className={`w-14 h-14 ${SF_UI.rounding.card} bg-[var(--theme-accent)]/10 flex items-center justify-center text-[var(--theme-accent)] group-hover:scale-110 transition-transform`}>
                <Icons.Heart className="w-7 h-7" />
              </div>
              <div className="flex flex-col items-center gap-2 mt-2">
                <span className={`${SF_UI.typography.body} !text-[var(--theme-accent)]`}>Apoiar Dev</span>
                <span className={`${SF_UI.typography.caption} opacity-40`}>Mantenha o ritual</span>
              </div>
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className={`mt-10 p-8 ${SF_UI.rounding.modal} bg-white/5 border border-dashed border-white/10 flex flex-col items-center gap-4`}>
            <Icons.Settings className="w-8 h-8 opacity-10" />
            <p className="text-[0.6rem] font-black text-white/10 uppercase tracking-[0.5em] text-center max-w-xs leading-relaxed">
              Expansão do sistema de protocolos prevista para as próximas iterações.
            </p>
        </div>

      </div>
    </div>

  )
}
