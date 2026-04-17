import React from 'react'
import { createPortal } from 'react-dom'
import { Icons } from './Icons'
import { SKILLS } from '../utils/skills'
import { THEMES } from '../utils/themes'
import { PlayerData } from '../utils/persistence'

interface SkillsMenuProps {
  coins: number
  maxHealth: number
  onBack: () => void
  onUpgradeHealth: () => void
  unlockedSkills: { [id: string]: { level: number } }
  equippedSkills: string[]
  onBuySkill: (id: string, cost: number) => void
  onToggleEquip: (id: string) => void
  furyStats: { level: number }
  coinStats: { level: number }
  onUpgradeFury: () => void
  onUpgradeCoins: () => void
  settings: PlayerData['settings']
}

export const SkillsMenu: React.FC<SkillsMenuProps> = ({
  coins, maxHealth, onBack, onUpgradeHealth,
  unlockedSkills, equippedSkills, onBuySkill, onToggleEquip,
  furyStats, coinStats, onUpgradeFury, onUpgradeCoins, settings
}) => {
  const [activeTooltip, setActiveTooltip] = React.useState<{ id: string; text: string; rect: DOMRect } | null>(null)

  const hpUpgradeCost = 50 * Math.pow(1.5, Math.floor((maxHealth - 100) / 10))
  const furyUpgradeCost = 80 * Math.pow(1.8, furyStats.level - 1)
  const coinUpgradeCost = 100 * Math.pow(1.5, coinStats.level - 1)

  const canEquipMore = equippedSkills.length < 2
  const hpProgress = Math.min(100, ((maxHealth - 100) / 300) * 100)
  
  const themeId = settings.theme
  const currentTheme = THEMES[themeId] || THEMES.neon
  const isRetro = currentTheme.isRetro

  // Common styles for consistency
  const cardClass = `glass rounded-2xl flex flex-col transition-all overflow-hidden`
  const upperTierClass = `flex items-center gap-3 p-3`
  const footerTierClass = `bg-black/25 px-3 py-1.5 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-white/5 min-h-[2rem]`
  const iconBoxClass = `w-12 h-12 shrink-0 rounded-xl flex items-center justify-center shadow-inner border border-white/10`
  const actionColClass = `w-[5.5rem] sm:w-24 shrink-0 flex flex-col gap-2 justify-center`
  const titleClass = `font-black tracking-wider text-[var(--theme-text)] m-0 uppercase leading-tight ${isRetro ? 'text-[0.75rem]' : 'text-sm'}`
  const badgeClass = `font-black px-1.5 py-0.5 rounded-lg flex items-center h-5 ${isRetro ? 'text-[0.45rem]' : 'text-[0.6rem]'}`
  const statBadgeClass = `bg-black/40 text-white/70 px-1.5 py-1 rounded-md font-bold flex items-center gap-1 border border-white/5 whitespace-nowrap ${isRetro ? 'text-[0.45rem]' : 'text-[0.55rem]'}`

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
        <div className="w-52 p-3 bg-[var(--theme-bgLight)] border border-[var(--theme-accent)]/40 rounded-xl shadow-2xl backdrop-blur-2xl animate-fade-in ring-1 ring-white/10">
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
      className="animate-fade-in w-full h-full flex flex-col items-center overflow-y-auto custom-scrollbar"
      onScroll={() => activeTooltip && setActiveTooltip(null)}
    >
      {/* ── FIXED STICKY HEADER ── */}
      <div className="sticky top-0 z-30 w-full bg-[var(--theme-bg)]/90 backdrop-blur-xl border-b border-white/5 px-4 pt-6 pb-4 flex flex-col gap-4 shadow-xl shadow-black/40">
        <div className="w-full max-w-lg md:max-w-4xl mx-auto flex items-center justify-between gap-4">

          {/* Back and Title */}
          <div className="flex items-center gap-3">
            <button className="btn-outline !p-2.5 rounded-xl h-11 w-11 flex items-center justify-center transition-transform active:scale-90 hover:bg-white/5" onClick={onBack}>
              <Icons.Back className="w-4.5 h-4.5" />
            </button>
            <div className="flex flex-col">
              <h2 className="text-[0.6rem] font-black tracking-[0.3em] text-[var(--theme-text)] uppercase opacity-60 m-0">MELHORIAS</h2>
              <div className="flex items-center gap-1.5 text-[var(--theme-accent)] font-black mt-1">
                <Icons.Coin className="w-3.5 h-3.5" />
                <span className="text-base tracking-tighter">{coins}</span>
              </div>
            </div>
          </div>

          {/* Prominent Skill Slots */}
          <div className="flex items-center gap-2.5 bg-black/20 p-1.5 rounded-2xl border border-white/5">
            {[0, 1].map(i => {
              const id = equippedSkills[i]
              const skill = id ? SKILLS.find(s => s.id === id) : null
              return (
                <button
                  key={i}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all relative cursor-pointer
                    ${skill
                      ? 'border-2 shadow-lg hover:scale-110 active:scale-95'
                      : 'border border-dashed border-white/10 bg-white/5 opacity-40 cursor-default'
                    }`}
                  onClick={() => skill && onToggleEquip(skill.id)}
                  style={skill ? {
                    borderColor: skill.color,
                    boxShadow: `0 0 15px ${skill.bgColor}, inset 0 0 10px ${skill.bgColor}`,
                    background: `linear-gradient(135deg, ${skill.bgColor}, rgba(0,0,0,0.5))`
                  } : {}}
                  title={skill ? `Desequipar ${skill.name}` : ''}
                >
                  {skill ? (
                    React.createElement(Icons[skill.icon as keyof typeof Icons], { className: "w-6 h-6" })
                  ) : <span className="text-white/10 text-xs font-black">+</span>}
                  {skill && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-[var(--theme-bg)] flex items-center justify-center">
                      <span className="text-[6px] text-white font-black">✕</span>
                    </div>
                  )}
                </button>
              )
            })}
            <div className="px-1.5 flex flex-col items-center">
              <span className="text-[0.65rem] font-black text-white/40 leading-none">{equippedSkills.length}</span>
              <div className="w-px h-2 bg-white/10 my-0.5" />
              <span className="text-[0.5rem] font-black text-white/20 leading-none">2</span>
            </div>
          </div>
        </div>

        {/* ── HEADER EXTENSION: Stat Legend ── */}
        <div className="w-full max-w-lg md:max-w-4xl mx-auto flex items-center justify-center gap-4 px-2 py-2 mt-1 bg-white/5 rounded-xl border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-1 text-[0.6rem] font-black text-white/40 uppercase tracking-widest">
            <Icons.Cooldown className="w-3 h-3 text-[var(--theme-textDim)]" /> CD
          </div>
          <div className="flex items-center gap-1 text-[0.6rem] font-black text-white/40 uppercase tracking-widest">
            <Icons.Duration className="w-3 h-3 text-[var(--theme-textDim)]" /> Duração
          </div>
          <div className="flex items-center gap-1 text-[0.6rem] font-black text-white/40 uppercase tracking-widest">
            <Icons.Extra className="w-3 h-3 text-[var(--theme-textDim)]" /> Extra
          </div>
          <div className="flex items-center gap-1 text-[0.6rem] font-black text-white/40 uppercase tracking-widest">
            <Icons.Cast className="w-3 h-3 text-[var(--theme-textDim)]" /> Cast
          </div>
        </div>
      </div>

      <div className="w-full max-w-lg md:max-w-4xl flex flex-col gap-3 px-4 pt-6">
        {/* ── Scrollable list ── */}
        <div className="menu-content-grid flex flex-col gap-3 pb-8">
          <div key="hp-upgrade" className={cardClass} onPointerDown={e => e.stopPropagation()}>
            <div className={upperTierClass}>
              <div
                className={iconBoxClass}
                style={{ background: 'rgba(255,60,80,0.1)' }}
              >
                <Icons.Heart className="w-6 h-6 text-[#FF3C50] drop-shadow-[0_0_8px_rgba(255,60,80,0.5)]" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <TooltipTrigger id="hp-tip" text="Aumenta sua vida total. Quanto mais vida, mais tempo você sobrevive à fome.">
                  <h3 className={titleClass}>Vida Máxima</h3>
                </TooltipTrigger>
              </div>
              <div className={actionColClass}>
                <button
                  className={`w-full h-11 flex flex-col items-center justify-center rounded-xl transition-all active:scale-95
                               ${coins >= hpUpgradeCost ? 'btn-upgrade-blink' : 'btn-upgrade-matte opacity-60'}
                            `}
                  onClick={onUpgradeHealth}
                  disabled={coins < hpUpgradeCost}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black leading-none">{Math.floor(hpUpgradeCost)}</span>
                    <Icons.Coin className="w-2.5 h-2.5 opacity-80" />
                  </div>
                  <span className="text-[0.45rem] font-black uppercase mt-1 tracking-tighter leading-none">UPGRADE</span>
                </button>
              </div>
            </div>
            
            <div className={footerTierClass}>
              <span className={`${badgeClass} bg-[var(--theme-secondary)]/10 text-[var(--theme-secondary)] shrink-0`}>{maxHealth} HP</span>
              <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden mx-1">
                <div className="h-full hp-gradient rounded-full transition-[width] duration-300" style={{ width: `${hpProgress}%` }} />
              </div>
              <span className={`font-black text-white/20 uppercase tracking-tighter leading-none whitespace-nowrap ${isRetro ? 'text-[0.4rem]' : 'text-[0.5rem]'}`}>Limiar 400</span>
            </div>
          </div>

          <div key="fury-upgrade" className={cardClass} onPointerDown={e => e.stopPropagation()}>
            <div className={upperTierClass}>
              <div
                className={iconBoxClass}
                style={{ background: 'rgba(255,0,60,0.1)' }}
              >
                <Icons.Fury className="w-6 h-6 text-[#FF003C] drop-shadow-[0_0_8px_rgba(255,0,60,0.5)]" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <TooltipTrigger id="fury-tip" text="Ao coletar itens rapidamente, você entra em Fúria, ganhando bônus de velocidade e moedas.">
                   <h3 className={titleClass}>Fúria</h3>
                </TooltipTrigger>
              </div>
              <div className={actionColClass}>
                <button
                  className={`w-full h-11 flex flex-col items-center justify-center rounded-xl transition-all active:scale-95
                               ${coins >= furyUpgradeCost ? 'btn-upgrade-blink' : 'btn-upgrade-matte opacity-60'}
                            `}
                  onClick={onUpgradeFury}
                  disabled={coins < furyUpgradeCost}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black leading-none">{Math.floor(furyUpgradeCost)}</span>
                    <Icons.Coin className="w-2.5 h-2.5 opacity-80" />
                  </div>
                  <span className="text-[0.45rem] font-black uppercase mt-1 tracking-tighter leading-none">UPGRADE</span>
                </button>
              </div>
            </div>
            
            <div className={`${footerTierClass} pr-4`}>
              <span className={`${badgeClass} bg-[#FF003C]/20 text-[#FF003C] shrink-0`}>LV {furyStats.level}</span>
              <div className="flex items-center gap-1.5 ml-auto">
                <span className={statBadgeClass}><Icons.Duration className="w-3 h-3 opacity-60" /> {(5 + (furyStats.level - 1) * 0.5).toFixed(1)}s</span>
                <span className={statBadgeClass}><Icons.Coin className="w-3 h-3 opacity-60" /> x{(1.5 + (furyStats.level - 1) * 0.25).toFixed(1)}</span>
                <span className={statBadgeClass}><Icons.Cast className="w-3 h-3 opacity-60" /> x{(1.2 + (furyStats.level - 1) * 0.04).toFixed(2)} spd</span>
                {furyStats.level >= 5 && <span className="text-[0.4rem] text-[#FF003C] font-black animate-pulse uppercase tracking-widest ml-1 whitespace-nowrap">⚠️ COMPLICAÇÕES</span>}
              </div>
            </div>
          </div>

          <div key="coin-upgrade" className={cardClass} onPointerDown={e => e.stopPropagation()}>
            <div className={upperTierClass}>
              <div
                className={iconBoxClass}
                style={{ background: 'rgba(251,191,36,0.1)' }}
              >
                <Icons.Coin className="w-6 h-6 text-[#FBBF24] drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <TooltipTrigger id="multiplier-tip" text="Aumenta o rendimento de todas as moedas coletadas na partida.">
                   <h3 className={titleClass}>Multiplicador</h3>
                </TooltipTrigger>
              </div>
              <div className={actionColClass}>
                <button
                  className={`w-full h-11 flex flex-col items-center justify-center rounded-xl transition-all active:scale-95
                               ${coins >= coinUpgradeCost ? 'btn-upgrade-blink' : 'btn-upgrade-matte opacity-60'}
                            `}
                  onClick={onUpgradeCoins}
                  disabled={coins < coinUpgradeCost}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black leading-none">{Math.floor(coinUpgradeCost)}</span>
                    <Icons.Coin className="w-2.5 h-2.5 opacity-80" />
                  </div>
                  <span className="text-[0.45rem] font-black uppercase mt-1 tracking-tighter leading-none">UPGRADE</span>
                </button>
              </div>
            </div>
            
            <div className={footerTierClass}>
              <span className={`${badgeClass} bg-[#FBBF24]/20 text-[#FBBF24]`}>LV {coinStats.level}</span>
              <div className="flex items-center gap-3 ml-auto">
                <span className={statBadgeClass}><Icons.Coin className="w-3 h-3 opacity-60" /> x{(1.0 + (coinStats.level - 1) * 0.15).toFixed(2)} Ganho Extra</span>
              </div>
            </div>
          </div>

          {/* Skill cards */}
          {SKILLS.map((s, idx) => ({ s, idx })).sort((a, b) => {
            const getPriority = (skill: typeof SKILLS[0]) => {
              const sData = unlockedSkills[skill.id]
              const isUnlocked = !!sData && (sData.level ?? 0) > 0
              const isEquipped = equippedSkills.includes(skill.id)
              const lv = isUnlocked ? Math.max(1, sData!.level) : 0
              const cost = Math.ceil(skill.cost * Math.pow(2.5, lv))
              const canAfford = coins >= cost

              if (isEquipped) return 0
              if (isUnlocked && canAfford) return 1
              if (isUnlocked) return 2
              return 3
            }

            const pA = getPriority(a.s)
            const pB = getPriority(b.s)

            if (pA !== pB) return pA - pB
            return a.idx - b.idx // Original order as tiebreaker
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
                className={`${cardClass}
                    ${isEquipped ? 'ring-1' : ''}
                    ${!isUnlocked ? 'opacity-60' : ''}
                  `}
                style={{
                  ...(isEquipped ? { '--tw-ring-color': skill.color, boxShadow: `0 0 12px ${skill.bgColor}` } as React.CSSProperties : {}),
                }}
              >
                <div className={upperTierClass}>
                  {/* Icon */}
                  <div
                    className={iconBoxClass}
                    style={{ backgroundColor: skill.bgColor, color: skill.color }}
                  >
                    {React.createElement(Icons[skill.icon as keyof typeof Icons], { className: `w-6 h-6 ${isRetro ? 'scale-90' : ''}` })}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center">
                      <TooltipTrigger id={`tip-${skill.id}`} text={skill.desc}>
                         <span className={titleClass}>{skill.name}</span>
                      </TooltipTrigger>
                      {!isUnlocked && <Icons.Lock className="w-3.5 h-3.5 opacity-40 ml-2" />}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className={actionColClass} onPointerDown={e => e.stopPropagation()}>
                    <button
                      className={`w-full h-11 flex flex-col items-center justify-center rounded-xl transition-all active:scale-95
                                   ${coins >= cost ? 'btn-upgrade-blink' : 'btn-upgrade-matte opacity-60'}
                                `}
                      onClick={() => onBuySkill(skill.id, skill.cost)}
                      disabled={coins < cost}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-black leading-none">{cost}</span>
                        <Icons.Coin className="w-2 h-2 opacity-80" />
                      </div>
                      <span className="text-[0.4rem] font-black uppercase mt-1 tracking-tighter leading-none">{isUnlocked ? 'UPGRADE' : 'COMPRAR'}</span>
                    </button>
                    {isUnlocked && (
                      <button
                        className={`w-full h-10 flex items-center justify-center rounded-xl border text-sm font-extrabold
                                   cursor-pointer transition-all active:scale-95
                                   ${isEquipped
                            ? 'bg-[var(--theme-red, #ff3c50)] border-[var(--theme-red, #ff3c50)] text-white shadow-lg'
                            : canEquipMore
                              ? 'bg-transparent border-[var(--theme-primary)]/40 text-[var(--theme-primary)] hover:bg-[var(--theme-primary)] hover:text-[var(--theme-bg)]'
                              : 'bg-transparent border-[var(--theme-border)] text-[var(--theme-textDim)] opacity-20 cursor-not-allowed'
                          }`}
                        onClick={() => onToggleEquip(skill.id)}
                        disabled={!isEquipped && !canEquipMore}
                      >
                        {isEquipped ? <Icons.Close className="w-3.5 h-3.5" /> : <Icons.Check className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                <div className={footerTierClass}>
                  {isUnlocked && (
                    <span 
                      className={`${badgeClass} ring-1 ring-inset`} 
                      style={{ 
                        color: skill.color, 
                        backgroundColor: `${skill.bgColor}22`, 
                        ['--tw-ring-color' as any]: `${skill.color}44` 
                      }}
                    >
                      LV {lv}
                    </span>
                  )}
                  <div className="flex items-center gap-3 ml-auto">
                    <span className={statBadgeClass}>
                      <Icons.Cooldown className="w-3 h-3 opacity-60" /> {cdStr}
                    </span>
                    <span className={statBadgeClass}>
                      <Icons.Duration className="w-3 h-3 opacity-60" /> {durStr}
                    </span>
                    {extra && (
                      <span className={statBadgeClass}>
                        <Icons.Extra className="w-3 h-3 opacity-60" /> {extra}
                      </span>
                    )}
                    <span className={statBadgeClass}>
                      <Icons.Cast className="w-3 h-3 opacity-60" /> {castStr}
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
