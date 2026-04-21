import React, { useState } from 'react'
import { Icons } from './Icons'
import { THEMES } from '../utils/themes'
import { ColorValue } from '../utils/persistence'
import { SF_UI } from '../utils/ui-system'

interface AppearanceMenuProps {
  coins: number
  onBack: () => void
  unlockedCosmetics: string[]
  settings: {
    playerColor: ColorValue;
    playerShape: string;
    snakeColor: ColorValue;
    snakeShape: string;
    theme: string;
  }
  onBuyCosmetic: (id: string, cost: number) => void
  onEquipCosmetic: (type: 'playerColor' | 'snakeColor' | 'playerShape' | 'snakeShape' | 'theme', value: any, id: string) => void
  onCheat: () => void
}

const COSMETICS = {
  colors: [
    { id: 'color_electric', name: 'ELECTRIC BLUE', cost: 8000, value: { primary: 0x00A0FF, secondary: 0x00FFFF } },
    { id: 'color_plasma', name: 'PLASMA PURPLE', cost: 8000, value: { primary: 0xFF00FF, secondary: 0xFFD700 } },
    { id: 'color_bumblebee', name: 'BUMBLEBEE', cost: 15000, value: { primary: 0x000000, secondary: 0xFFD700 } },
    { id: 'color_cyber', name: 'CYBERPUNK', cost: 25000, value: { primary: 0xFF00FF, secondary: 0x00FFFF } },
    { id: 'color_toxic', name: 'TOXIC WASTE', cost: 25000, value: { primary: 0x000000, secondary: 0x00FF00 } },
    { id: 'color_mint', name: 'FRESH MINT', cost: 45000, value: { primary: 0x00FF82, secondary: 0xFFFFFF } },
    { id: 'color_lava', name: 'LAVA CORE', cost: 75000, value: { primary: 0x8B0000, secondary: 0xFF4500 } },
    { id: 'color_police', name: 'EMERGENCY', cost: 75000, value: { primary: 0x0000FF, secondary: 0xFF0000 } },
    { id: 'color_phantom', name: 'PHANTOM', cost: 100000, value: { primary: 0x222222, secondary: 0x888888 } },
    { id: 'color_rainbow', name: 'IRIDESCENT', cost: 150000, value: { primary: 0xADFF2F, secondary: 0xFF1493 } },
  ],
  shapes: [
    { id: 'shape_rounded', name: 'ARREDONDADO', cost: 0, value: 'rounded' },
    { id: 'shape_square', name: 'QUADRADO', cost: 7500, value: 'square' },
    { id: 'shape_circle', name: 'CÍRCULO', cost: 7500, value: 'circle' },
    { id: 'shape_triangle', name: 'TRIÂNGULO', cost: 7500, value: 'triangle' },
    { id: 'shape_rhombus', name: 'LOSANGO', cost: 7500, value: 'rhombus' },
  ],
  themes: [
    { id: 'theme_neon', name: 'NEON', cost: 0, value: 'neon', desc: 'Estilo moderno padrão' },
    { id: 'theme_light', name: 'LIGHT NEON', cost: 50000, value: 'light_neon', desc: 'Brilhante e minimalista' },
    { id: 'theme_pink', name: 'PINK NEON', cost: 200000, value: 'pink_neon', desc: 'Vibe Cyberpunk rosa' },
    { id: 'theme_black', name: 'BLACK NEON', cost: 200000, value: 'black_neon', desc: 'Escuridão absoluta e neon' },
    { id: 'theme_sky', name: 'SKY', cost: 350000, value: 'sky', desc: 'Céu azul com nuvens' },
    { id: 'theme_universe', name: 'UNIVERSO', cost: 350000, value: 'universe', desc: 'Espaço sideral profundo' },
    { id: 'theme_gameboy', name: 'GAMEBOY', cost: 600000, value: 'gameboy', desc: 'Nostalgia dos portáteis' },
    { id: 'theme_nokia', name: 'NOKIA 3310', cost: 1000000, value: 'nokia', desc: 'O lendário tijolinho' },
  ]
}

export const AppearanceMenu: React.FC<AppearanceMenuProps> = ({
  coins, onBack, unlockedCosmetics, settings, onBuyCosmetic, onEquipCosmetic, onCheat
}) => {
  const [activeTab, setActiveTab] = useState<'snake' | 'player' | 'themes'>('snake')
  const [cheatProgress, setCheatProgress] = useState<string[]>([])

  const handleCheatClick = (shape: string) => {
    const sequence = ['square', 'square', 'triangle', 'circle', 'square', 'rhombus']
    const newProgress = [...cheatProgress, shape].slice(-6)
    setCheatProgress(newProgress)

    if (newProgress.length === 6 && newProgress.every((v, i) => v === sequence[i])) {
      onCheat()
      setCheatProgress([]) // Reset
    }
  }

  const currentThemeId = settings.theme
  const currentTheme = THEMES[currentThemeId] || THEMES.neon
  const isSpecialTheme = currentTheme.category === 'special'

  const renderHex = (hex: number) => `#${hex.toString(16).padStart(6, '0')}`

  const renderProduct = (item: any, type: any, subtype: string) => {
    const isUnlocked = unlockedCosmetics.includes(item.id) || item.cost === 0
    let isEquipped = false
    if (subtype === 'color') {
      const current = type === 'player' ? settings.playerColor : settings.snakeColor
      if (item.id === 'default') {
        isEquipped = current === null || current === undefined
      } else if (current && typeof current === 'object' && typeof item.value === 'object') {
        isEquipped = current.primary === item.value.primary && current.secondary === item.value.secondary
      } else {
        isEquipped = current === item.value
      }
    } else if (subtype === 'shape') {
      isEquipped = type === 'player' ? settings.playerShape === item.value : settings.snakeShape === item.value
    } else {
      isEquipped = settings.theme === item.value
    }

    const canAfford = coins >= item.cost

    return (
      <div key={item.id} className={`${SF_UI.layout.card} ${isEquipped ? `${SF_UI.effects.glowPrimary} !bg-white/5` : ''}`}>
        <div className={`w-14 h-14 ${SF_UI.rounding.button} flex items-center justify-center shrink-0 border border-white/10 bg-black/20 overflow-hidden`}>
          {subtype === 'color' ? (
            <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white/20 overflow-hidden relative"
              style={{ background: renderHex(item.id === 'default' ? (type === 'player' ? currentTheme.colors.enginePlayer : currentTheme.colors.engineSnake) : item.value.primary) }}>
              <div className="w-1/2 h-1/2 rounded-full shadow-inner"
                style={{ background: renderHex(item.id === 'default' ? (type === 'player' ? currentTheme.colors.enginePlayer : currentTheme.colors.engineSnake) : item.value.secondary) }} />
            </div>
          ) : subtype === 'shape' ? (
            <div
              className="w-10 h-10 flex items-center justify-center text-white"
              onPointerDown={() => handleCheatClick(item.value)}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 opacity-80 pointer-events-none">
                {item.value === 'circle' && <circle cx="12" cy="12" r="10" />}
                {item.value === 'triangle' && <path d="M12 2L2 20h20L12 2z" />}
                {item.value === 'rhombus' && <path d="M12 2l10 10-10 10L2 12z" />}
                {item.value === 'square' && <rect x="2" y="2" width="20" height="20" />}
                {item.value === 'rounded' && <rect x="2" y="2" width="20" height="20" rx="6" />}
              </svg>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col">
              <div className="w-full h-1/2" style={{ background: THEMES[item.value]?.colors.bg || '#000' }} />
              <div className="w-full h-1/2 flex items-center justify-center text-[8px] uppercase font-black" style={{ background: THEMES[item.value]?.colors.primary || '#fff', color: THEMES[item.value]?.colors.bg || '#000' }}>
                {THEMES[item.value]?.isRetro ? 'Retro' : 'Neo'}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <span className={`${SF_UI.typography.body} !text-[0.65rem] tracking-wider truncate`}>
            {item.name}
          </span>
          {item.desc && <p className={`${SF_UI.typography.caption} !text-[0.5rem] line-clamp-2`}>{item.desc}</p>}
          {!isUnlocked && (
            <div className="flex items-center gap-1.5 mt-1">
              <Icons.Coin className="w-3 h-3 text-[var(--theme-accent)]" />
              <span className="text-[0.6rem] font-black text-[var(--theme-accent)]">{item.cost}</span>
            </div>
          )}
        </div>

        <button
          className={`${isUnlocked ? (isEquipped ? `!bg-transparent border-white/5 opacity-40` : SF_UI.button.secondary) : (canAfford ? SF_UI.button.primary : `opacity-20 grayscale cursor-not-allowed ${SF_UI.button.secondary}`)} !w-auto !px-4 !py-2.5 !text-[0.55rem]`}
          onClick={() => {
            if (!isUnlocked) {
              if (canAfford) onBuyCosmetic(item.id, item.cost)
            } else if (!isEquipped) {
              const equipType = subtype === 'theme' ? 'theme' : (type === 'player' ? (subtype === 'color' ? 'playerColor' : 'playerShape') : (subtype === 'color' ? 'snakeColor' : 'snakeShape'))
              onEquipCosmetic(equipType as any, item.value, item.id)
            }
          }}
          disabled={!isUnlocked && !canAfford}
        >
          {isUnlocked ? (isEquipped ? 'ATIVO' : 'EQUIPAR') : 'ADQUIRIR'}
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in w-full h-full flex flex-col items-center px-4 py-10 overflow-y-auto custom-scrollbar bg-[#0c0c12]">
      <div className="w-full max-w-lg md:max-w-4xl flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button className={`${SF_UI.button.back}`} onClick={onBack}>
            <Icons.Back className="w-5 h-5 opacity-40" />
          </button>
          <div className="flex flex-col">
            <h2 className={`${SF_UI.typography.label} !opacity-40`}>CUSTOMIZAÇÃO VISUAL</h2>
            <div className="flex items-center gap-2 text-[var(--theme-accent)] font-black mt-1">
              <Icons.Coin className="w-5 h-5" />
              <span className="text-xl tracking-tighter">{coins}</span>
            </div>
          </div>
        </div>

        {/* Categories Tabs */}
        <div className={`grid grid-cols-3 gap-3 p-2 bg-black/40 ${SF_UI.rounding.modal} border border-white/5`}>
          {[
            { id: 'snake', label: 'COBRA', icon: <Icons.Snake className="w-4 h-4" /> },
            { id: 'player', label: 'VOCÊ', icon: <Icons.Appearance className="w-4 h-4" /> },
            { id: 'themes', label: 'TEMAS', icon: <Icons.Play className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              className={`py-3 flex items-center justify-center gap-2 ${SF_UI.rounding.button} text-[0.6rem] font-black tracking-widest transition-all
                ${activeTab === tab.id
                  ? 'bg-white text-black shadow-xl shadow-white/10'
                  : 'text-white/40 hover:text-white'}`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Lists */}
        {activeTab === 'themes' ? (
          <div className="flex flex-col gap-10">
            {/* Simple Themes */}
            <div className={`${SF_UI.layout.section}`}>
              <h3 className={`${SF_UI.typography.sectionTitle} text-white/40`}>TEMAS BÁSICOS</h3>
              <div className="menu-content-grid flex flex-col gap-4 pb-20">
                {COSMETICS.themes.filter(t => (THEMES[t.value]?.category || 'simple') === 'simple').map(t => renderProduct(t, 'all', 'theme'))}
              </div>
            </div>

            {/* Special Themes */}
            <div className={`${SF_UI.layout.section}`}>
              <h3 className={`${SF_UI.typography.sectionTitle} text-[var(--theme-accent)]`}>COLEÇÕES ESPECIAIS (LIMITED)</h3>
              <div className="menu-content-grid flex flex-col gap-4 pb-20">
                {COSMETICS.themes.filter(t => THEMES[t.value]?.category === 'special').map(t => renderProduct(t, 'all', 'theme'))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8 relative">
            {isSpecialTheme && (
              <div className={`${SF_UI.layout.modal} absolute inset-x-0 top-0 z-10 glass ${SF_UI.rounding.modal} flex flex-col items-center justify-center p-12 text-center animate-fade-in backdrop-blur-3xl shadow-2xl`}>
                <Icons.Close className="w-16 h-16 text-white/10 mb-6" />
                <h4 className={`${SF_UI.typography.h2}`}>PACOTE FECHADO</h4>
                <p className={`${SF_UI.typography.caption} mt-2 normal-case leading-relaxed mx-auto max-w-[280px]`}>
                  Temas especiais (como {currentTheme.name}) são identidades completas e não permitem trocas de cor ou formato.
                </p>
                <button className={`${SF_UI.button.primary} mt-10 !w-auto !px-10`} onClick={() => setActiveTab('themes')}>
                  ESCOLHER OUTRO TEMA
                </button>
              </div>
            )}

            {/* Colors Section */}
            <div className={`${SF_UI.layout.section} transition-opacity duration-300 ${isSpecialTheme ? 'opacity-10 pointer-events-none' : ''}`}>
              <h3 className={`${SF_UI.typography.sectionTitle} text-white/40`}>ESPECTRO DE CORES</h3>
              <div className="menu-content-grid flex flex-col gap-4">
                {renderProduct({ id: 'default', name: 'FLUXO PADRÃO', cost: 0, value: null, desc: 'Cor original do tema selecionado' }, activeTab, 'color')}
                {COSMETICS.colors.map(c => renderProduct(c, activeTab, 'color'))}
              </div>
            </div>

            {/* Shapes Section */}
            <div className={`${SF_UI.layout.section} transition-opacity duration-300 ${isSpecialTheme ? 'opacity-10 pointer-events-none' : ''}`}>
              <h3 className={`${SF_UI.typography.sectionTitle} text-white/40`}>TOPOLOGIA GEOMÉTRICA</h3>
              <div className="menu-content-grid flex flex-col gap-4 pb-20">
                {COSMETICS.shapes.map(s => renderProduct(s, activeTab, 'shape'))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
