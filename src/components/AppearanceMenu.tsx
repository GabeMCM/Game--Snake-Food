import React, { useState } from 'react'
import { Icons } from './Icons'
import { THEMES } from '../utils/themes'
import { ColorValue } from '../utils/persistence'

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
    { id: 'color_electric', name: 'ELECTRIC BLUE', cost: 1000, value: { primary: 0x00A0FF, secondary: 0x00FFFF } },
    { id: 'color_plasma', name: 'PLASMA PURPLE', cost: 1000, value: { primary: 0xFF00FF, secondary: 0xFFD700 } },
    { id: 'color_bumblebee', name: 'BUMBLEBEE', cost: 1500, value: { primary: 0x000000, secondary: 0xFFD700 } },
    { id: 'color_cyber', name: 'CYBERPUNK', cost: 2500, value: { primary: 0xFF00FF, secondary: 0x00FFFF } },
    { id: 'color_toxic', name: 'TOXIC WASTE', cost: 2500, value: { primary: 0x000000, secondary: 0x00FF00 } },
    { id: 'color_mint', name: 'FRESH MINT', cost: 3000, value: { primary: 0x00FF82, secondary: 0xFFFFFF } },
    { id: 'color_lava', name: 'LAVA CORE', cost: 5000, value: { primary: 0x8B0000, secondary: 0xFF4500 } },
    { id: 'color_police', name: 'EMERGENCY', cost: 5000, value: { primary: 0x0000FF, secondary: 0xFF0000 } },
    { id: 'color_phantom', name: 'PHANTOM', cost: 10000, value: { primary: 0x222222, secondary: 0x888888 } },
    { id: 'color_rainbow', name: 'IRIDESCENT', cost: 25000, value: { primary: 0xADFF2F, secondary: 0xFF1493 } },
  ],
  shapes: [
    { id: 'shape_rounded', name: 'ARREDONDADO', cost: 0, value: 'rounded' },
    { id: 'shape_square', name: 'QUADRADO', cost: 1200, value: 'square' },
    { id: 'shape_circle', name: 'CÍRCULO', cost: 1200, value: 'circle' },
    { id: 'shape_triangle', name: 'TRIÂNGULO', cost: 1200, value: 'triangle' },
    { id: 'shape_rhombus', name: 'LOSANGO', cost: 1200, value: 'rhombus' },
  ],
  themes: [
    { id: 'theme_neon', name: 'NEON', cost: 0, value: 'neon', desc: 'Estilo moderno padrão' },
    { id: 'theme_light', name: 'LIGHT NEON', cost: 5000, value: 'light_neon', desc: 'Brilhante e minimalista' },
    { id: 'theme_pink', name: 'PINK NEON', cost: 10000, value: 'pink_neon', desc: 'Vibe Cyberpunk rosa' },
    { id: 'theme_black', name: 'BLACK NEON', cost: 10000, value: 'black_neon', desc: 'Escuridão absoluta e neon' },
    { id: 'theme_sky', name: 'SKY', cost: 25000, value: 'sky', desc: 'Céu azul com nuvens' },
    { id: 'theme_universe', name: 'UNIVERSO', cost: 40000, value: 'universe', desc: 'Espaço sideral profundo' },
    { id: 'theme_gameboy', name: 'GAMEBOY', cost: 60000, value: 'gameboy', desc: 'Nostalgia dos portáteis' },
    { id: 'theme_nokia', name: 'NOKIA 3310', cost: 80000, value: 'nokia', desc: 'O lendário tijolinho' },
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
      <div key={item.id} className={`shop-card ${isEquipped ? 'shop-card-equipped' : ''}`}>
        <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border border-[var(--theme-border)] bg-[var(--theme-bgLight)] overflow-hidden">
            {subtype === 'color' ? (
                <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-[var(--theme-border)] overflow-hidden relative"
                     style={{ background: renderHex(item.id === 'default' ? (type === 'player' ? currentTheme.colors.enginePlayer : currentTheme.colors.engineSnake) : item.value.primary) }}>
                  <div className="w-1/2 h-1/2 rounded-full shadow-inner" 
                       style={{ background: renderHex(item.id === 'default' ? (type === 'player' ? currentTheme.colors.enginePlayer : currentTheme.colors.engineSnake) : item.value.secondary) }} />
                </div>
            ) : subtype === 'shape' ? (
                <div 
                  className="w-10 h-10 flex items-center justify-center text-[var(--theme-text)]"
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
                    <div className="w-full h-1/2 flex items-center justify-center text-[10px] uppercase font-black" style={{ background: THEMES[item.value]?.colors.primary || '#fff', color: THEMES[item.value]?.colors.bg || '#000' }}>
                        {THEMES[item.value]?.isRetro ? 'Retro' : 'Neo'}
                    </div>
                </div>
            )}
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <span className="text-[0.6rem] font-black text-[var(--theme-text)] tracking-wider uppercase truncate">
            {item.name}
          </span>
          {item.desc && <p className="text-[0.55rem] text-[var(--theme-textDim)] m-0 leading-tight line-clamp-2">{item.desc}</p>}
          {!isUnlocked && (
            <div className="flex items-center gap-1 mt-0.5">
              <Icons.Coin className="w-3 h-3 text-[var(--theme-accent)]" />
              <span className="text-[0.55rem] font-bold text-[var(--theme-accent)]">{item.cost}</span>
            </div>
          )}
        </div>

        <button
          className={`btn-primary !px-3 !py-2 shrink-0 ${!isUnlocked && !canAfford ? 'opacity-30 grayscale cursor-not-allowed' : ''} ${isUnlocked && !isEquipped ? 'btn-secondary' : isEquipped ? 'opacity-40 !bg-transparent !text-[var(--theme-textDim)] border border-[var(--theme-border)] cursor-default' : ''}`}
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
          {isUnlocked ? (isEquipped ? 'ATIVO' : 'EQUIPAR') : 'COMPRAR'}
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in w-full h-full flex flex-col items-center px-4 py-8 overflow-y-auto overflow-x-hidden no-scrollbar">
      <div className="menu-container">
        
        {/* Header */}
        <div className="flex items-center gap-4 shrink-0">
          <button className="btn-outline !p-3 rounded-2xl" onClick={onBack}>
            <Icons.Back className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <h2 className="text-[0.7rem] font-black tracking-[0.3em] text-[var(--theme-text)] uppercase m-0">APARÊNCIA</h2>
            <div className="flex items-center gap-1.5 text-[var(--theme-accent)] font-bold mt-0.5">
              <Icons.Coin className="w-4 h-4" />
              <span className="text-sm">{coins}</span>
            </div>
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="flex gap-4 p-1.5 bg-[var(--theme-bgLight)] rounded-2xl border border-[var(--theme-border)]">
          {[
            { id: 'snake', label: 'COBRA', icon: <Icons.Snake className="w-4 h-4" /> },
            { id: 'player', label: 'VOCÊ', icon: <Icons.Appearance className="w-4 h-4" /> },
            { id: 'themes', label: 'TEMAS', icon: <Icons.Play className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl text-[0.6rem] font-black tracking-widest transition-all
                ${activeTab === tab.id 
                  ? 'bg-[var(--theme-text)] text-[var(--theme-bg)] shadow-lg' 
                  : 'text-[var(--theme-textDim)] hover:text-[var(--theme-text)]'}`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Lists */}
        {activeTab === 'themes' ? (
          <div className="flex flex-col gap-8">
            {/* Simple Themes */}
            <div className="flex flex-col gap-3">
              <h3 className="text-[0.55rem] font-black tracking-[0.3em] text-[var(--theme-textDim)] uppercase ml-1">TEMAS SIMPLES</h3>
              <div className="menu-content-grid flex flex-col gap-3">
                {COSMETICS.themes.filter(t => (THEMES[t.value]?.category || 'simple') === 'simple').map(t => renderProduct(t, 'all', 'theme'))}
              </div>
            </div>
            
            {/* Special Themes */}
            <div className="flex flex-col gap-3">
              <h3 className="text-[0.55rem] font-black tracking-[0.3em] text-[var(--theme-accent)] uppercase ml-1">TEMAS ESPECIAIS (LIMITED)</h3>
              <div className="menu-content-grid flex flex-col gap-3">
                {COSMETICS.themes.filter(t => THEMES[t.value]?.category === 'special').map(t => renderProduct(t, 'all', 'theme'))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 relative">
            {isSpecialTheme && (
                <div className="absolute inset-x-0 top-0 z-10 glass rounded-3xl flex flex-col items-center justify-center p-8 text-center animate-fade-in backdrop-blur-md">
                    <Icons.Close className="w-12 h-12 text-[var(--theme-accent)] mb-4 opacity-70" />
                    <h4 className="text-[0.65rem] font-black text-[var(--theme-text)] tracking-wider">PERSONALIZAÇÃO DESATIVADA</h4>
                    <p className="text-[0.6rem] text-[var(--theme-textDim)] mt-2 uppercase tracking-tight leading-relaxed">
                        Temas especiais (como {currentTheme.name}) são pacotes fechados e não permitem trocas de cor ou formato.
                    </p>
                    <button className="btn-outline mt-6 !px-8" onClick={() => setActiveTab('themes')}>
                        TROCAR TEMA
                    </button>
                </div>
            )}
            
            {/* Colors Section */}
            <div className={`flex flex-col gap-3 transition-opacity duration-300 ${isSpecialTheme ? 'opacity-20' : ''}`}>
              <h3 className="text-[0.55rem] font-black tracking-[0.3em] text-[var(--theme-textDim)] uppercase ml-1">CORES</h3>
              <div className="menu-content-grid flex flex-col gap-3">
                {renderProduct({ id: 'default', name: 'PREDEFINIDO', cost: 0, value: null, desc: 'Cor padrão do tema' }, activeTab, 'color')}
                {COSMETICS.colors.map(c => renderProduct(c, activeTab, 'color'))}
              </div>
            </div>

            {/* Shapes Section */}
            <div className={`flex flex-col gap-3 transition-opacity duration-300 ${isSpecialTheme ? 'opacity-20' : ''}`}>
              <h3 className="text-[0.55rem] font-black tracking-[0.3em] text-[var(--theme-textDim)] uppercase ml-1">FORMATOS</h3>
              <div className="menu-content-grid flex flex-col gap-3">
                {COSMETICS.shapes.map(s => renderProduct(s, activeTab, 'shape'))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
