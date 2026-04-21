import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { Icons } from './Icons'
import { SKILLS, SKILL_RECHARGE_TYPES } from '../utils/skills'
import { THEMES } from '../utils/themes'
import { PlayerData } from '../utils/persistence'
import { 
  getRequiredExpForNextLevel, 
  getSkillRequiredExpForNextLevel,
  getHealthBonusForLevel,
  getCoinMultiplierForLevel,
  getFuryEfficiencyForLevel
} from '../utils/progression'
import { SF_UI } from '../utils/ui-system'

interface SkillsMenuProps {
  coins: number
  level: number
  exp: number
  onBack: () => void
  unlockedSkills: { [id: string]: { level: number, exp: number } }
  equippedSkills: string[]
  onBuySkill: (id: string, cost: number) => void
  onToggleEquip: (id: string) => void
  settings: PlayerData['settings']
}

export const SkillsMenu: React.FC<SkillsMenuProps> = ({
  coins, level, exp, onBack,
  unlockedSkills, equippedSkills, onBuySkill, onToggleEquip,
  settings
}) => {
  const [activeTooltip, setActiveTooltip] = React.useState<{ id: string; text: string; rect: DOMRect } | null>(null)

  const canEquipMore = equippedSkills.length < 2
  
  const themeId = settings.theme
  const currentTheme = THEMES[themeId] || THEMES.neon
  const isRetro = currentTheme.isRetro

  // Common styles for consistency
  const cardClass = `${SF_UI.rounding.modal} glass flex flex-col transition-all overflow-hidden border border-white/5`
  const upperTierClass = `flex items-center gap-4 p-5`
  const footerTierClass = `bg-black/25 px-5 py-3 flex items-center gap-3 overflow-x-auto no-scrollbar border-t border-white/5 min-h-[3rem]`
  const iconBoxClass = `w-14 h-14 shrink-0 ${SF_UI.rounding.button} flex items-center justify-center shadow-inner border border-white/10`
  const actionColClass = `w-[6rem] sm:w-28 shrink-0 flex flex-col gap-2 justify-center`
  const titleClass = `${SF_UI.typography.h1} !normal-case tracking-widest`
  const badgeClass = `font-black px-2 py-1 ${SF_UI.rounding.inner} flex items-center h-6 ${isRetro ? 'text-[0.45rem]' : 'text-[0.6rem]'}`
  const statBadgeClass = `bg-black/40 text-white/70 px-2 py-1.5 ${SF_UI.rounding.inner} font-bold flex items-center gap-2 border border-white/5 whitespace-nowrap ${isRetro ? 'text-[0.45rem]' : 'text-[0.55rem]'}`

  const TooltipPortal = () => {
    if (!activeTooltip) return null
    
    // Calculate position: above the rect, centered horizontally
    const top = activeTooltip.rect.top - 12 // 12px gap
    const left = activeTooltip.rect.left + activeTooltip.rect.width / 2

    return createPortal(
      <div 
        className="fixed z-[9999] pointer-events-none"
        style={{ 
          top: `${top}px`, 
          left: `${left}px`, 
          transform: 'translate(-50%, -100%)' 
        }}
      >
        <div className={`w-56 p-4 ${SF_UI.effects.glass} border border-[var(--theme-accent)]/40 ${SF_UI.rounding.card} shadow-2xl animate-fade-in ring-1 ring-white/10`}>
          <p className="text-[0.65rem] font-bold text-[var(--theme-text)] uppercase leading-relaxed m-0 text-center tracking-wide">
            {activeTooltip.text}
          </p>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[var(--theme-bgLight)] border-r border-b border-[var(--theme-accent)]/40 rotate-45" />
        </div>
      </div>,
      document.body
    )
  }

  const TooltipTrigger = ({ id, text, children }: { id: string, text: string, children: React.ReactNode }) => {
    const triggerRef = React.useRef<HTMLDivElement>(null)

    const handleInteract = (e: React.MouseEvent | React.PointerEvent) => {
      if (activeTooltip?.id === id) {
        setActiveTooltip(null)
      } else {
        const rect = triggerRef.current?.getBoundingClientRect()
        if (rect) {
          setActiveTooltip({ id, text, rect })
        }
      }
    }

    return (
      <div 
        ref={triggerRef}
        className="relative flex items-center gap-2 group"
        onMouseEnter={(e) => !('ontouchstart' in window) && handleInteract(e as any)}
        onMouseLeave={() => !('ontouchstart' in window) && setActiveTooltip(null)}
        onClick={handleInteract}
      >
        {children}
        <Icons.Help className="w-3.5 h-3.5 opacity-30 group-hover:opacity-100 transition-opacity cursor-help" />
      </div>
    )
  }

  return (
    <div 
      className="animate-fade-in w-full h-full flex flex-col landscape:sm:flex-row items-center overflow-hidden bg-[#0c0c12]"
      onScroll={() => activeTooltip && setActiveTooltip(null)}
    >
      {/* ── LEFT SIDEBAR (LANDSCAPE) / STICKY HEADER (PORTRAIT) ── */}
      <div className="z-30 w-full landscape:sm:w-[22rem] h-auto landscape:sm:h-full bg-[var(--theme-bg)]/90 landscape:sm:bg-[var(--theme-bg)]/60 backdrop-blur-3xl border-b landscape:sm:border-b-0 landscape:sm:border-r border-white/5 px-4 sm:px-6 pt-10 pb-6 flex flex-col gap-6 shadow-2xl shadow-black/60 overflow-y-auto no-scrollbar shrink-0">
        
        {/* Back and Title Row */}
        <div className="w-full flex items-center justify-between landscape:sm:flex-col landscape:sm:items-start gap-4">
          <div className="flex items-center landscape:sm:flex-col landscape:sm:items-start gap-4">
            <button className={`${SF_UI.button.back}`} onClick={onBack}>
              <Icons.Back className="w-5 h-5 opacity-40" />
            </button>
            <div className="flex flex-col">
              <h2 className={`${SF_UI.typography.label} !opacity-40`}>MELHORIAS</h2>
              <div className="flex items-center gap-2 text-[var(--theme-accent)] font-black mt-1">
                <Icons.Coin className="w-5 h-5" />
                <span className="text-xl tracking-tighter">{coins}</span>
              </div>
            </div>
          </div>

          {/* Skill Slots Container */}
          <div className={`flex items-center gap-3 bg-black/40 p-2 ${SF_UI.rounding.modal} border border-white/5 ${SF_UI.effects.glowPrimary}`}>
            {[0, 1].map(i => {
              const id = equippedSkills[i]
              const skill = id ? SKILLS.find(s => s.id === id) : null
              return (
                <button
                  key={i}
                  className={`w-12 h-12 sm:w-14 sm:h-14 ${SF_UI.rounding.full} flex items-center justify-center text-xl transition-all relative cursor-pointer
                    ${skill
                      ? 'border-2 shadow-lg hover:scale-110 active:scale-95'
                      : 'border border-dashed border-white/10 bg-white/5 opacity-40 cursor-default'
                    }`}
                  onClick={() => skill && onToggleEquip(skill.id)}
                  style={skill ? {
                    borderColor: skill.color,
                    boxShadow: `0 0 20px ${skill.bgColor}, inset 0 0 10px ${skill.bgColor}`,
                    background: `linear-gradient(135deg, ${skill.bgColor}, rgba(0,0,0,0.5))`
                  } : {}}
                  title={skill ? `Desequipar ${skill.name}` : ''}
                >
                  {skill ? (
                    React.createElement(Icons[skill.icon as keyof typeof Icons], { className: "w-6 h-6 sm:w-7 sm:h-7" })
                  ) : <span className="text-white/10 text-[0.65rem] font-black">+</span>}
                  {skill && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red border-2 border-[var(--theme-bg)] flex items-center justify-center">
                      <span className="text-[8px] text-white font-black">✕</span>
                    </div>
                  )}
                </button>
              )
            })}
            <div className="px-1 flex flex-col items-center">
              <span className="text-[0.65rem] font-black text-white/40 leading-none">{equippedSkills.length}</span>
              <div className="w-px h-2 bg-white/10 my-0.5" />
              <span className="text-[0.5rem] font-black text-white/20 leading-none">2</span>
            </div>
          </div>
        </div>

        {/* Bonus Stats Section (Full Width in Sidebar) */}
        <div className="w-full flex-col gap-2 landscape:sm:flex hidden">
           <span className={`${SF_UI.typography.label} mb-2 block`}>BÔNUS PROTOCOLARES</span>
           <div className="flex flex-col gap-2">
              <div className={`${SF_UI.layout.card} !p-3 justify-between`}>
                <span className={`${SF_UI.typography.label} !opacity-30`}>Vitalidade</span>
                <span className="text-[0.8rem] font-black text-neon-green">+{getHealthBonusForLevel(level)} HP</span>
              </div>
              <div className={`${SF_UI.layout.card} !p-3 justify-between ${SF_UI.effects.glowAccent}`}>
                <span className={`${SF_UI.typography.label} !opacity-30`}>Rentabilidade</span>
                <span className="text-[0.8rem] font-black text-gold">+{((getCoinMultiplierForLevel(level) - 1) * 100).toFixed(0)}%</span>
              </div>
              <div className={`${SF_UI.layout.card} !p-3 justify-between ${SF_UI.effects.glowPrimary}`}>
                <span className={`${SF_UI.typography.label} !opacity-30`}>Eficiência</span>
                <span className="text-[0.8rem] font-black text-neon-blue">+{((getFuryEfficiencyForLevel(level) - 1) * 100).toFixed(1)}%</span>
              </div>
           </div>
        </div>

        {/* Mobile Horizontal Layout for Stats */}
        <div className="w-full grid grid-cols-3 gap-2 landscape:sm:hidden">
          <div className={`${SF_UI.layout.card} !p-2 flex-col text-center`}>
             <span className="text-[0.5rem] font-black opacity-30 uppercase">HP</span>
             <span className="text-[0.7rem] font-black text-neon-green">+{getHealthBonusForLevel(level)}</span>
          </div>
          <div className={`${SF_UI.layout.card} !p-2 flex-col text-center ${SF_UI.effects.glowAccent}`}>
             <span className="text-[0.5rem] font-black opacity-30 uppercase">MOEDA</span>
             <span className="text-[0.7rem] font-black text-gold">+{((getCoinMultiplierForLevel(level) - 1) * 100).toFixed(0)}%</span>
          </div>
          <div className={`${SF_UI.layout.card} !p-2 flex-col text-center ${SF_UI.effects.glowPrimary}`}>
             <span className="text-[0.5rem] font-black opacity-30 uppercase">FÚRIA</span>
             <span className="text-[0.7rem] font-black text-neon-blue">+{((getFuryEfficiencyForLevel(level) - 1) * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* Legend (Sidebar Bottom or Mobile Flex) */}
        <div className="w-full mt-auto pt-6 border-t border-white/5 flex flex-wrap landscape:sm:flex-col gap-4 landscape:sm:gap-3 opacity-60">
           <div className="flex items-center gap-2">
             <Icons.Battery className="w-3.5 h-3.5 text-gold shrink-0" />
             <span className="text-[0.55rem] font-black tracking-widest uppercase">REC</span>
             <span className="landscape:sm:inline hidden text-[0.5rem] opacity-40 ml-auto">RECARGA</span>
           </div>
           <div className="flex items-center gap-2">
             <Icons.Cooldown className="w-3.5 h-3.5 text-neon-green shrink-0" />
             <span className="text-[0.55rem] font-black tracking-widest uppercase">DUR</span>
             <span className="landscape:sm:inline hidden text-[0.5rem] opacity-40 ml-auto">DURAÇÃO</span>
           </div>
           <div className="flex items-center gap-2">
             <Icons.Extra className="w-3.5 h-3.5 text-neon-pink shrink-0" />
             <span className="text-[0.55rem] font-black tracking-widest uppercase">BON</span>
             <span className="landscape:sm:inline hidden text-[0.5rem] opacity-40 ml-auto">BÔNUS</span>
           </div>
           <div className="flex items-center gap-2">
             <Icons.Cast className="w-3.5 h-3.5 text-neon-blue shrink-0" />
             <span className="text-[0.55rem] font-black tracking-widest uppercase">CON</span>
             <span className="landscape:sm:inline hidden text-[0.5rem] opacity-40 ml-auto">CONJURAÇÃO</span>
           </div>
        </div>
      </div>

      {/* ── MAIN CONTENT (SCROLLABLE GRID) ── */}
      <div className="flex-1 w-full h-full overflow-y-auto custom-scrollbar p-6 sm:p-10">
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 pb-20">
           {SKILLS.map((s, idx) => ({ s, idx })).sort((a, b) => {
            const isEquippedA = equippedSkills.includes(a.s.id)
            const isEquippedB = equippedSkills.includes(b.s.id)
            if (isEquippedA && !isEquippedB) return -1
            if (!isEquippedA && isEquippedB) return 1
            if (a.s.cost !== b.s.cost) return a.s.cost - b.s.cost
            return a.idx - b.idx 
          }).map(({ s: skill }) => {
            const sData = unlockedSkills[skill.id]
            const isUnlocked = !!sData && (sData.level ?? 0) > 0
            const lv = isUnlocked ? Math.max(1, sData!.level) : 0
            const cost = Math.ceil(skill.cost * Math.pow(2.5, lv))
            const isEquipped = equippedSkills.includes(skill.id)
            const cdStr = isUnlocked ? skill.getCd(lv) : skill.getCd(1)
            const durStr = isUnlocked ? skill.getDur(lv) : skill.getDur(1)
            const extra = isUnlocked ? skill.getExtra(lv) : skill.getExtra(1)
            const castStr = isUnlocked ? skill.getCast(lv) : skill.getCast(1)

            return (
              <div
                key={skill.id}
                className={`${cardClass} transition-transform active:scale-[0.99]
                    ${!isUnlocked ? 'opacity-40 grayscale shadow-inner' : 'shadow-lg hover:shadow-[var(--skill-glow)]'}
                  `}
                style={{
                  ...(isUnlocked ? { '--skill-glow': `${skill.bgColor}22` } as any : {}),
                  borderColor: isEquipped ? skill.color : undefined
                }}
              >
                <div className={upperTierClass}>
                  {/* Icon Box */}
                  <div
                    className={iconBoxClass}
                    style={{ backgroundColor: `${skill.bgColor}11`, color: skill.color, borderColor: `${skill.color}44` }}
                  >
                    {React.createElement(Icons[skill.icon as keyof typeof Icons], { className: "w-7 h-7" })}
                  </div>

                  {/* Info Column */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                    <div className="flex items-center gap-3">
                      <TooltipTrigger 
                        id={`tip-${skill.id}`} 
                        text={skill.desc}
                      >
                         <h3 className={titleClass}>{skill.name}</h3>
                      </TooltipTrigger>
                      {skill.isAutomatic && (
                        <div className={`bg-neon-blue/10 text-neon-blue text-[0.45rem] px-2 py-0.5 ${SF_UI.rounding.inner} font-black border border-neon-blue/20`}>AUTO</div>
                      )}
                    </div>
                    {!isUnlocked && <span className={`${SF_UI.typography.caption} text-white/20 tracking-widest`}>HABILIDADE BLOQUEADA</span>}
                  </div>

                  {/* Action Column */}
                  <div className={actionColClass} onPointerDown={e => e.stopPropagation()}>
                    {!isUnlocked ? (
                      <button
                        className={`w-full h-14 flex flex-col items-center justify-center ${SF_UI.rounding.button} transition-all active:scale-95
                                     ${coins >= skill.cost ? 'bg-white text-black shadow-xl shadow-white/10' : 'bg-white/5 opacity-60 text-white/40 border border-white/5'}
                                  `}
                        onClick={() => onBuySkill(skill.id, skill.cost)}
                        disabled={coins < skill.cost}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black tracking-tighter leading-none">{skill.cost}</span>
                          <Icons.Coin className="w-3 h-3 text-[var(--theme-accent)]" />
                        </div>
                        <span className="text-[0.45rem] font-black uppercase mt-1 tracking-widest leading-none">ADQUIRIR</span>
                      </button>
                    ) : (
                      <button
                        className={`w-full h-14 flex items-center justify-center ${SF_UI.rounding.button} border text-[0.65rem] font-black tracking-[0.2em] uppercase
                                   cursor-pointer transition-all active:scale-95
                                   ${isEquipped
                            ? 'bg-red border-red text-white shadow-xl shadow-red/20'
                            : canEquipMore
                              ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                              : 'bg-transparent border-white/5 text-white/10 cursor-not-allowed'
                          }`}
                        onClick={() => onToggleEquip(skill.id)}
                        disabled={!isEquipped && !canEquipMore}
                      >
                        {isEquipped ? 'LIBERAR' : canEquipMore ? 'EQUIPAR' : 'LIMITE'}
                      </button>
                    )}
                  </div>
                </div>

                <div className={footerTierClass + " relative pt-6 pb-4"}>
                  {isUnlocked && (
                    <>
                      <div className="absolute top-0 left-0 w-full px-5 h-1 flex items-center">
                        <div className="w-full h-full bg-white/5 rounded-full overflow-hidden">
                           <div 
                              className="h-full transition-all duration-1000"
                              style={{ 
                                width: `${(sData.exp / getSkillRequiredExpForNextLevel(lv)) * 100}%`,
                                backgroundColor: skill.color,
                                boxShadow: `0 0 10px ${skill.color}` 
                              }}
                           />
                        </div>
                      </div>
                      <div className="flex flex-col min-w-[3.5rem]">
                        <span 
                          className={badgeClass} 
                          style={{ 
                            color: skill.color, 
                            backgroundColor: `${skill.bgColor}22`, 
                            border: `1px solid ${skill.color}44`
                          }}
                        >
                          {lv > 30 ? `MASTER ${lv - 30}` : `GRAU ${lv}`}
                        </span>
                        <span className="text-[0.45rem] font-black text-white/30 uppercase tracking-tighter mt-1">
                          {lv > 30 ? 'SOBERANO' : `${sData.exp}/${getSkillRequiredExpForNextLevel(lv)} XP`}
                        </span>
                      </div>
                    </>
                  )}
                   <div className="flex items-center gap-2 sm:gap-3 ml-auto flex-wrap justify-end">
                    <span className={statBadgeClass}>
                       <Icons.Battery className="w-3.5 h-3.5 text-gold" /> {cdStr}
                    </span>
                    <span className={statBadgeClass}>
                       <Icons.Cooldown className="w-3.5 h-3.5 text-neon-green" /> {durStr}
                    </span>
                    <span className={statBadgeClass}>
                       <Icons.Extra className="w-3.5 h-3.5 text-neon-pink" /> {extra || 'N/A'}
                    </span>
                    <span className={statBadgeClass}>
                       <Icons.Cast className="w-3.5 h-3.5 text-neon-blue" /> {castStr}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <TooltipPortal />
    </div>
  )
}
