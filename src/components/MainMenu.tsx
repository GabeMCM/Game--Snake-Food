import React from 'react'
import { AdSlot } from './AdSlot'
import { Icons } from './Icons'
import { getRequiredExpForNextLevel } from '../utils/progression'
import { SF_UI } from '../utils/ui-system'
import { motion } from 'framer-motion'

interface MainMenuProps {
  coins: number
  bestTime: number
  onStart: () => void
  onOpenSkills: () => void
  onOpenAppearance: () => void
  onOpenSettings: () => void
  onOpenProfile: () => void
  onOpenRanking: () => void
  level: number
  exp: number
  isAuthenticated?: boolean
  userNickname?: string
  avatarUrl?: string
}

export const MainMenu: React.FC<MainMenuProps> = ({
  coins, bestTime, onStart, onOpenSkills, onOpenAppearance, onOpenSettings, onOpenProfile, onOpenRanking,
  level = 1, exp = 0, isAuthenticated = false, userNickname = 'Explorador', avatarUrl
}) => {
  const reqExp = getRequiredExpForNextLevel(level || 1)
  const safeExp = exp || 0
  const progress = Math.min(100, (safeExp / reqExp) * 100)

  // Estado da Aba Ativa (Witcher Style)
  const [activeTab, setActiveTab] = React.useState('play');

  const mainTabs = [
    { id: 'upgrades', label: 'UPGRADES', icon: <Icons.Upgrades className="w-7 h-7" />, onClick: onOpenSkills },
    { id: 'ranking', label: 'RANKING', icon: <Icons.Trophy className="w-7 h-7" />, onClick: onOpenRanking },
    { id: 'appearance', label: 'APARÊNCIA', icon: <Icons.Appearance className="w-7 h-7" />, onClick: onOpenAppearance },
  ].filter(tab => tab.id !== 'ranking' || isAuthenticated);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start overflow-hidden bg-[#0c0c12]">

      {/* ── BACKGROUND ATMOSPHERE ── */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden sm:landscape:flex hidden">
        <div className="scale-[5] filter blur-2xl flex flex-col items-center">
          <h1 className="text-white text-9xl font-black tracking-widest leading-none">SNAKE</h1>
          <h1 className="text-white text-9xl font-black tracking-widest leading-none">FOOD</h1>
        </div>
      </div>

      <div className={`animate-fade-in relative z-10 w-full h-full flex flex-col items-center justify-between p-4 sm:p-10 pt-10 sm:pt-12`}>

        {/* ── HEADER ── */}
        <div className="w-full flex items-start justify-between px-2 max-w-6xl gap-4">
          <div className="flex items-center gap-3 sm:gap-5 group cursor-pointer active:scale-95 transition-all flex-1 min-w-0" onClick={onOpenProfile}>
            <div
              className={`w-12 h-12 sm:w-14 sm:h-14 ${SF_UI.rounding.avatar} border flex items-center justify-center relative overflow-hidden shadow-lg shrink-0
                          ${isAuthenticated ? `${SF_UI.effects.glowPrimary} bg-neon-blue/10` : 'bg-white/5 border-white/10 hover:bg-white/10 shadow-none'}`}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={userNickname} className="w-full h-full object-cover" />
              ) : isAuthenticated ? (
                <Icons.User className="w-6 h-6 sm:w-7 sm:h-7 text-neon-blue" />
              ) : (
                <Icons.User className="w-6 h-6 sm:w-7 sm:h-7 text-white/20" />
              )}

              <div className={`absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 ${SF_UI.rounding.inner} bg-neon-blue border-[2px] sm:border-[3px] border-[#0c0c12] flex items-center justify-center text-[0.6rem] sm:text-[0.7rem] font-black text-white`}>
                {level}
              </div>
            </div>

            <div className="flex flex-col min-w-0">
              <h2 className={`${SF_UI.typography.h1} !normal-case tracking-widest truncate text-sm sm:text-base`}>{userNickname}</h2>
              <div className={`w-24 sm:w-32 h-1 bg-white/5 ${SF_UI.rounding.full} mt-1.5 overflow-hidden`}>
                <div className="h-full bg-neon-blue animate-exp-pulse" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className={`${SF_UI.rounding.card} glass px-4 sm:px-6 py-1.5 sm:py-2 border border-white/5 flex items-center gap-4 sm:gap-6 hidden sm:flex ${SF_UI.effects.glowPrimary}`}>
              <div className="flex flex-col items-center">
                <span className={`${SF_UI.typography.label}`}>MOEDAS</span>
                <span className="text-sm font-black text-[var(--theme-accent)]">{coins}</span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="flex flex-col items-center">
                <span className={`${SF_UI.typography.label}`}>RECORDE</span>
                <span className="text-sm font-black text-white">{bestTime.toFixed(1)}s</span>
              </div>
            </div>

            <button
              className={`${SF_UI.button.back} h-10 w-10 sm:h-11 sm:w-11 ${SF_UI.rounding.card}`}
              onClick={onOpenSettings}
            >
              <Icons.Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* ── CENTRAL HUB (LANDSCAPE ONLY) ── */}
        <div className="hidden landscape:flex flex-col items-center w-full max-w-6xl flex-1 justify-center gap-12">
          {/* ... existing landscape content ... */}
          <div className="flex flex-col items-center gap-1 mb-2">
            <h1 className="text-neon-glow bg-gradient-to-br from-[var(--theme-primary)] via-[var(--theme-secondary)] to-[var(--theme-accent)] bg-clip-text text-transparent text-6xl font-black tracking-[0.2em] uppercase">
              SNAKE FOOD
            </h1>
            <span className="text-[0.65rem] font-black tracking-[0.8em] text-[var(--theme-primary)] opacity-40 uppercase">R E F O R G E D</span>
          </div>

          {/* Secondary Tabs */}
          <div className="flex items-end justify-center w-full border-b border-white/5 px-20 scale-90">
            {mainTabs.map((tab) => {
              return (
                <div
                  key={tab.id}
                  onClick={tab.onClick}
                  className={`relative flex flex-col items-center gap-4 px-10 py-6 cursor-pointer opacity-40 hover:opacity-100 transition-all duration-300 group`}
                >
                  <div className={`transition-transform duration-300 group-hover:scale-110 text-white`}>
                    {tab.icon}
                  </div>
                  <span className={`text-[0.7rem] font-black tracking-[0.3em] uppercase text-white/50 group-hover:text-white`}>
                    {tab.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-col items-center gap-6 mt-4">
            <button
              onClick={onStart}
              className={`group flex items-center gap-6 px-12 py-5 ${SF_UI.rounding.modal} border border-neon-blue/40 bg-neon-blue/10 hover:bg-neon-blue/20 transition-all active:scale-95 ${SF_UI.effects.glowPrimary}`}
            >
              <Icons.Play className="w-6 h-6 text-neon-blue animate-pulse" />
              <span className="text-[1.2rem] font-black tracking-[0.6em] text-white uppercase group-hover:text-neon-blue transition-colors">
                JOGAR AGORA
              </span>
              <Icons.Play className="w-6 h-6 text-neon-blue animate-pulse" />
            </button>
            <span className="text-[0.55rem] font-black tracking-[0.6em] text-white/20 uppercase">
              INICIAR RITUAL DE SOBREVIVÊNCIA
            </span>
          </div>

        </div>

        {/* ── PORTRAIT LIST (EXCLUSIVE) ── */}
        <div className="flex landscape:hidden portrait-only-list w-full flex-col items-center justify-center flex-1 gap-6 sm:gap-10 pb-4">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[0.55rem] sm:text-[0.6rem] font-black tracking-[0.4em] text-white/30 uppercase">VOCÊ É A COMIDA</span>
            <h1 className="text-neon-glow bg-gradient-to-br from-[var(--theme-primary)] via-[var(--theme-secondary)] to-[var(--theme-accent)] bg-clip-text text-transparent text-4xl sm:text-5xl font-black tracking-[0.1em] text-center">SNAKE FOOD</h1>
          </div>

          <button
            onClick={onStart}
            className={`w-72 py-6 ${SF_UI.rounding.modal} bg-neon-blue text-[#0c0c12] font-black tracking-[0.4em] uppercase flex items-center justify-center gap-3 active:scale-95 transition-all ${SF_UI.effects.glowPrimary}`}
          >
            <Icons.Play className="w-6 h-6" />
            JOGAR AGORA
          </button>

          <div className={`grid ${mainTabs.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-3 w-full max-w-sm px-4`}>
            {mainTabs.map(tab => (
              <button
                key={`mob-${tab.id}`}
                className={`py-6 ${SF_UI.rounding.card} border border-white/5 bg-white/5 flex flex-col items-center gap-3 justify-center active:scale-95 transition-all hover:bg-white/10`}
                onClick={tab.onClick}
              >
                <div className="text-neon-blue opacity-80">{tab.icon}</div>
                <span className="text-[0.55rem] font-black tracking-widest text-white/60 uppercase">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className={`${SF_UI.rounding.card} glass px-8 py-4 flex items-center gap-8 ${SF_UI.effects.glowAccent}`}>
            <div className="flex flex-col items-center">
              <span className={`${SF_UI.typography.label}`}>MOEDAS</span>
              <span className="text-neon-gold text-2xl font-black">{coins}</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col items-center">
              <span className={`${SF_UI.typography.label}`}>RECORDE</span>
              <span className="text-white text-2xl font-black">{bestTime.toFixed(1)}s</span>
            </div>
          </div>
        </div>

        {/* ── FOOTER EMPTY (CLEAN) ── */}
        <div className="w-full h-8 sm:landscape:flex hidden" />
      </div>
    </div>
  )
}
