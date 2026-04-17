import React, { useState, useEffect, useRef } from 'react'
import { GameView, GameViewRef } from './components/GameView'
import { MainMenu } from './components/MainMenu'
import { SkillsMenu } from './components/SkillsMenu'
import { AppearanceMenu } from './components/AppearanceMenu'
import { loadPlayerData, savePlayerData, PlayerData } from './utils/persistence'
import { AdSlot } from './components/AdSlot'
import { applyThemeToCSS, THEMES } from './utils/themes'
import { Icons } from './components/Icons'
import { HealthBar } from './components/HealthBar'
import { FuryBar } from './components/FuryBar'
import { SKILLS } from './utils/skills'
import './App.css'

type View = 'menu' | 'playing' | 'skills' | 'appearance'

const renderHex = (hex: any) => {
  if (typeof hex === 'object' && hex !== null) return `#${hex.primary.toString(16).padStart(6, '0')}`
  const h = typeof hex === 'number' ? hex : 0xFFFFFF
  return `#${h.toString(16).padStart(6, '0')}`
}

function App() {
  const [view, setView] = useState<View>('menu')
  const [playerData, setPlayerData] = useState<PlayerData>(loadPlayerData())
  
  // Estado Temporário da Rodada
  const [coinsInRound, setCoinsInRound] = useState(0)
  const [lastTimeCoin, setLastTimeCoin] = useState(0)
  const [time, setTime] = useState(0)
  const [health, setHealth] = useState(100)
  const [bestTime, setBestTime] = useState(playerData.lastHighScore)
  
  // Fúria
  const [furyProgress, setFuryProgress] = useState(0)
  const [isFuryActive, setIsFuryActive] = useState(false)
  const [furyMode, setFuryMode] = useState('')
  
  // Estado das Habilidades
  const gameViewRef = useRef<GameViewRef>(null)
  const [activeSkills, setActiveSkills] = useState<{ [id: string]: boolean }>({})
  const [cooldowns, setCooldowns] = useState<{ [id: string]: number }>({})
  const [isCasting, setIsCasting] = useState<string | null>(null)
  const [isGameOver, setIsGameOver] = useState(false)
  const [adUsed, setAdUsed] = useState(false) // Trava para 1 anúncio por game
  const [showBackConfirm, setShowBackConfirm] = useState(false)

  // Sincronizar vida ao iniciar
  useEffect(() => {
    if (view === 'playing') {
      setHealth(playerData.maxHealth)
      setCoinsInRound(0)
      setLastTimeCoin(0)
      setTime(0)
      setActiveSkills({})
      setCooldowns({})
      setAdUsed(false) // Resetar no novo jogo
    }
  }, [view, playerData.maxHealth])

  // Aplicar tema globalmente
  useEffect(() => {
    applyThemeToCSS(playerData.settings.theme)
  }, [playerData.settings.theme])

  // Mobile height fix
  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      document.documentElement.style.setProperty('--app-h', `${window.innerHeight}px`);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Timer de Cooldown
  useEffect(() => {
    const timer = setInterval(() => {
      setCooldowns(prev => {
        const next = { ...prev }
        let changed = false
        Object.keys(next).forEach(id => {
          if (next[id] > 0) {
            next[id] = Math.max(0, next[id] - 0.1)
            changed = true
          }
        })
        return changed ? next : prev
      })
    }, 100)
    return () => clearInterval(timer)
  }, [])

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (view !== 'playing' || isGameOver || showBackConfirm) return

      if (e.code === 'Space') {
        e.preventDefault()
        gameViewRef.current?.triggerSwap()
      } else if (e.code === 'Digit1') {
        const skillId = playerData.equippedSkills[0]
        if (skillId) useSkill(skillId)
      } else if (e.code === 'Digit2') {
        const skillId = playerData.equippedSkills[1]
        if (skillId) useSkill(skillId)
      } else if (e.key === 'Escape') {
        handleBackToMenu()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [view, isGameOver, showBackConfirm, playerData.equippedSkills])

  const handleGameOver = () => {
    if (isGameOver) return
    setIsGameOver(true)
    
    // Parar o motor do jogo
    gameViewRef.current?.stop()
    
    const earned = coinsInRound
    const newBestTime = Math.max(time, playerData.lastHighScore)
    setBestTime(newBestTime)
    const updatedData = {
      ...playerData,
      coins: playerData.coins + earned,
      lastHighScore: newBestTime,
    }
    setPlayerData(updatedData)
    savePlayerData(updatedData)
  }

  const handleRestart = () => {
    setIsGameOver(false)
    setView('menu')
  }

  const handleBackToMenu = () => {
    gameViewRef.current?.stop()
    setShowBackConfirm(true)
  }

  const cancelBack = () => {
    setShowBackConfirm(false)
    gameViewRef.current?.start()
  }

  const confirmBack = () => {
    // Penalidade: perde 3/4 das moedas conquistadas nesta rodada (mantém 1/4)
    const penaltyCoins = Math.floor(coinsInRound / 4)
    const newBestTime = Math.max(time, playerData.lastHighScore)
    setBestTime(newBestTime)

    const updatedData = {
      ...playerData,
      coins: playerData.coins + penaltyCoins,
      lastHighScore: newBestTime,
    }
    setPlayerData(updatedData)
    savePlayerData(updatedData)

    setShowBackConfirm(false)
    setView('menu')
  }

  const handleDoubleCoins = () => {
    if (adUsed) return
    
    // Simular "Ver Anúncio"
    setAdUsed(true)
    const earned = coinsInRound
    const updatedData = {
      ...playerData,
      coins: playerData.coins + earned, // Adiciona mais uma vez a mesma quantia
    }
    setPlayerData(updatedData)
    savePlayerData(updatedData)
    setCoinsInRound(earned * 2) // Atualiza UI
    
    alert("Parabéns! Suas moedas foram dobradas!")
  }

  const handleUpgradeHealth = () => {
    const currentHP = playerData.maxHealth
    const cost = Math.floor(50 * Math.pow(1.5, (currentHP - 100) / 10))
    
    if (playerData.coins >= cost) {
      const updatedData = {
        ...playerData,
        coins: playerData.coins - cost,
        maxHealth: playerData.maxHealth + 10
      }
      setPlayerData(updatedData)
      savePlayerData(updatedData)
    }
  }

  const handleUpgradeFury = () => {
    const level = playerData.furyStats.level
    const cost = Math.floor(80 * Math.pow(2.0, level - 1))
    
    if (playerData.coins >= cost) {
      const updatedData = {
        ...playerData,
        coins: playerData.coins - cost,
        furyStats: {
          level: level + 1
        }
      }
      setPlayerData(updatedData)
      savePlayerData(updatedData)
    }
  }

  const handleUpgradeCoins = () => {
    const level = playerData.coinStats.level
    const cost = Math.floor(100 * Math.pow(1.8, level - 1))
    
    if (playerData.coins >= cost) {
      const updatedData = {
        ...playerData,
        coins: playerData.coins - cost,
        coinStats: {
          level: level + 1
        }
      }
      setPlayerData(updatedData)
      savePlayerData(updatedData)
    }
  }

  const handleCheat = () => {
    const updatedData = {
      ...playerData,
      coins: playerData.coins + 1000000,
    }
    setPlayerData(updatedData)
    savePlayerData(updatedData)
    console.log("💰 CÓDIGO SECRETO ATIVADO: +1,000,000 Moedas!")
  }

  const handleBuySkill = (id: string, baseCost: number) => {
    const currentLevel = playerData.unlockedSkills[id]?.level ?? 0
    // level 0 nunca deveria existir (mínimo após compra = 1),
    // mas tratamos para robustez contra save corrompido
    const effectiveLevel = Math.max(0, currentLevel)
    // Escalonamento Exponencial Dificultado: lv0=1x, lv1=2.5x, lv2=6.25x...
    const cost = Math.ceil(baseCost * Math.pow(2.5, effectiveLevel))
    
    if (playerData.coins >= cost) {
      const updatedData = {
        ...playerData,
        coins: playerData.coins - cost,
        unlockedSkills: {
          ...playerData.unlockedSkills,
          [id]: { level: effectiveLevel + 1 }  // garante mínimo 1 após compra
        }
      }
      setPlayerData(updatedData)
      savePlayerData(updatedData)
    }
  }

  const handleToggleEquip = (id: string) => {
    const isEquipped = playerData.equippedSkills.includes(id)
    let nextEquipped = [...playerData.equippedSkills]

    if (isEquipped) {
      nextEquipped = nextEquipped.filter(s => s !== id)
    } else {
      if (nextEquipped.length >= 2) return // BLOQUEADO: limite de 2
      nextEquipped.push(id)
    }

    const updatedData = { ...playerData, equippedSkills: nextEquipped }
    setPlayerData(updatedData)
    savePlayerData(updatedData)
  }

  const handleTimeUpdate = (t: number) => {
    if (isGameOver) return
    setTime(t)
    const secondsPassed = Math.floor(t)
    if (secondsPassed > 0 && secondsPassed % 10 === 0 && secondsPassed !== lastTimeCoin) {
      setCoinsInRound(prev => prev + 1)
      setLastTimeCoin(secondsPassed)
    }
  }

  const handleBuyCosmetic = (id: string, cost: number) => {
    if (playerData.coins >= cost) {
      const updatedData = {
        ...playerData,
        coins: playerData.coins - cost,
        unlockedCosmetics: [...playerData.unlockedCosmetics, id]
      }
      setPlayerData(updatedData)
      savePlayerData(updatedData)
    }
  }

  const handleEquipCosmetic = (type: string, value: any) => {
    const updatedData = {
      ...playerData,
      settings: {
        ...playerData.settings,
        [type]: value
      }
    }
    setPlayerData(updatedData)
    savePlayerData(updatedData)

    // Se mudou o tema, aplica imediatamente para o CSS
    if (type === 'theme') {
      applyThemeToCSS(value)
    }
  }

  const useSkill = (id: string) => {
    const skillStats = playerData.unlockedSkills[id]
    const skillDef = SKILLS.find(s => s.id === id)
    if (!skillStats || !skillDef || cooldowns[id] > 0 || isCasting) return

    const level = skillStats.level
    const castStr = skillDef.getCast(level)
    const castTimeMs = parseFloat(castStr) * 1000
    
    setIsCasting(id)
    
    setTimeout(() => {
      setIsCasting(null)
      
      if (id === 'invisibility') {
        const duration = 5000 + (level - 1) * 1000 // +1s por nível
        const cd = Math.max(5, 15 - (level - 1)) // -1s por nível (min 5s)
        
        gameViewRef.current?.activateInvisibility(duration)
        setActiveSkills(prev => ({ ...prev, [id]: true }))
        setCooldowns(prev => ({ ...prev, [id]: cd }))
        setTimeout(() => setActiveSkills(prev => ({ ...prev, [id]: false })), duration)
      }

      if (id === 'frost_aura') {
        const duration = 5000 + (level - 1) * 1000
        const cd = Math.max(10, 20 - (level - 1))
        
        gameViewRef.current?.toggleFrostAura(true)
        setActiveSkills(prev => ({ ...prev, [id]: true }))
        setCooldowns(prev => ({ ...prev, [id]: cd }))
        setTimeout(() => {
          gameViewRef.current?.toggleFrostAura(false)
          setActiveSkills(prev => ({ ...prev, [id]: false }))
        }, duration)
      }

      if (id === 'sacrifice') {
        const cd = Math.max(15, 30 - (level - 1) * 2)
        const healAmt = 30 + (level - 1) * 5
        
        gameViewRef.current?.activateSacrifice(5000, healAmt)
        setActiveSkills(prev => ({ ...prev, [id]: true }))
        setCooldowns(prev => ({ ...prev, [id]: cd }))
        setTimeout(() => setActiveSkills(prev => ({ ...prev, [id]: false })), 5000)
      }

      if (id === 'phantom_block') {
          const duration = 8000 + (level - 1) * 1000
          const count = 3 + Math.floor(level / 2)
          const cd = Math.max(10, 25 - (level - 1) * 2)

          gameViewRef.current?.activatePhantomBlock(duration, count)
          setActiveSkills(prev => ({ ...prev, [id]: true }))
          setCooldowns(prev => ({ ...prev, [id]: cd }))
          setTimeout(() => setActiveSkills(prev => ({ ...prev, [id]: false })), duration)
      }

      if (id === 'clones') {
          const duration = 10000 + (level - 1) * 1000
          const count = 1 + Math.floor(level / 2)
          const cd = Math.max(15, 30 - (level - 1) * 2)

          gameViewRef.current?.activateClones(duration, count)
          setActiveSkills(prev => ({ ...prev, [id]: true }))
          setCooldowns(prev => ({ ...prev, [id]: cd }))
          setTimeout(() => setActiveSkills(prev => ({ ...prev, [id]: false })), duration)
      }

      if (id === 'gain_zone') {
          const duration = 12000 + (level - 1) * 2000
          const radius = 5 + level
          const cd = Math.max(20, 40 - (level - 1) * 3)

          gameViewRef.current?.activateGainZone(duration, radius)
          setActiveSkills(prev => ({ ...prev, [id]: true }))
          setCooldowns(prev => ({ ...prev, [id]: cd }))
          setTimeout(() => setActiveSkills(prev => ({ ...prev, [id]: false })), duration)
      }

      if (id === 'explosive_bait') {
          const duration = 15000 
          const slowAmt = level > 1 ? Math.min(50, (level - 1) * 10) : 0
          const cd = Math.max(15, 35 - (level - 1) * 2)

          gameViewRef.current?.activateExplosiveBait(duration, slowAmt)
          setActiveSkills(prev => ({ ...prev, [id]: true }))
          setCooldowns(prev => ({ ...prev, [id]: cd }))
          setTimeout(() => setActiveSkills(prev => ({ ...prev, [id]: false })), duration)
      }

      if (id === 'intangibility') {
          const duration = 4000 + (level - 1) * 1000
          const cd = Math.max(15, 35 - (level - 1) * 2)

          gameViewRef.current?.activateIntangibility(duration)
          setActiveSkills(prev => ({ ...prev, [id]: true }))
          setCooldowns(prev => ({ ...prev, [id]: cd }))
          setTimeout(() => setActiveSkills(prev => ({ ...prev, [id]: false })), duration)
      }
    }, 800)
  }

  // Swap global: qualquer toque na tela durante o jogo dispara o swap
  const handleGlobalPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (view === 'playing' && !isGameOver) {
      if (e.cancelable) e.preventDefault()
      gameViewRef.current?.triggerSwap()
    }
  }


  return (
    <div
      className="app-bg w-full h-full flex-1 flex flex-col items-center justify-center overflow-hidden"
      onPointerDown={handleGlobalPointerDown}
    >
      {/* ═══ MAIN MENU ═══ */}
      {view === 'menu' && (
        <MainMenu 
          coins={playerData.coins}
          bestTime={bestTime}
          onStart={() => setView('playing')} 
          onOpenSkills={() => setView('skills')} 
          onOpenAppearance={() => setView('appearance')}
        />
      )}

      {/* ═══ APARÊNCIA MENU ═══ */}
      {view === 'appearance' && (
        <AppearanceMenu
          coins={playerData.coins}
          unlockedCosmetics={playerData.unlockedCosmetics}
          settings={playerData.settings}
          onBack={() => setView('menu')}
          onBuyCosmetic={handleBuyCosmetic}
          onEquipCosmetic={handleEquipCosmetic}
          onCheat={handleCheat}
        />
      )}

      {/* ═══ SKILLS MENU ═══ */}
      {view === 'skills' && (
        <SkillsMenu 
          coins={playerData.coins}
          maxHealth={playerData.maxHealth}
          unlockedSkills={playerData.unlockedSkills}
          equippedSkills={playerData.equippedSkills}
          onBack={() => setView('menu')}
          onUpgradeHealth={handleUpgradeHealth}
          onBuySkill={handleBuySkill}
          onToggleEquip={handleToggleEquip}
          furyStats={playerData.furyStats}
          coinStats={playerData.coinStats}
          onUpgradeFury={handleUpgradeFury}
          onUpgradeCoins={handleUpgradeCoins}
          settings={playerData.settings}
        />
      )}

      {/* ═══ PLAYING SCREEN ═══ */}
      {view === 'playing' && (
        <div className="playing-layout w-full h-full flex flex-col p-2 gap-2 relative">

          {/* ── HUD TOP: Coins + Time ── */}
          <div className="hud-column flex flex-row items-center shrink-0">
            <div className="glass neon-border rounded-xl px-4 py-2 flex items-center justify-between w-full max-w-[640px] mx-auto">
              <div className="flex items-center gap-4">
                <button
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/50
                             hover:text-white hover:bg-white/10 transition-all active:scale-90 flex items-center justify-center p-2.5"
                  onPointerDown={e => e.stopPropagation()}
                  onClick={handleBackToMenu}
                >
                  <Icons.Back className="w-full h-full" />
                </button>
                  <div className="flex items-center gap-2 font-extrabold">
                    <Icons.Coin className="w-4 h-4 text-gold" />
                    <span className="text-gold text-base">{coinsInRound}</span>
                  </div>
                </div>

                {/* Legend: What is the player? */}
                {(() => {
                  const themeId = playerData.settings.theme
                  const theme = THEMES[themeId] || THEMES.neon
                  const isSpecial = theme.category === 'special'
                  const effectiveColor = isSpecial ? (theme.colors.enginePlayer || 0xFFFFFF) : playerData.settings.playerColor
                  const effectiveShape = isSpecial ? (theme.isRetro ? 'square' : 'circle') : playerData.settings.playerShape

                  return (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 shadow-inner backdrop-blur-sm">
                      <div className="relative w-5 h-5 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill={renderHex(effectiveColor)} className="w-4 h-4 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                          {effectiveShape === 'circle' && <circle cx="12" cy="12" r="10" />}
                          {effectiveShape === 'triangle' && <path d="M12 2L2 20h20L12 2z" />}
                          {effectiveShape === 'rhombus' && <path d="M12 2l10 10-10 10L2 12z" />}
                          {effectiveShape === 'square' && <rect x="2" y="2" width="20" height="20" />}
                          {effectiveShape === 'rounded' && <rect x="2" y="2" width="20" height="20" rx="6" />}
                        </svg>
                        {/* Inner core only if NOT special and is dual color */}
                        {!isSpecial && effectiveColor && typeof effectiveColor === 'object' && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <svg viewBox="0 0 24 24" fill={renderHex((effectiveColor as any).secondary)} className="w-2 h-2 opacity-90">
                              {effectiveShape === 'circle' && <circle cx="12" cy="12" r="10" />}
                              {effectiveShape === 'triangle' && <path d="M12 2L2 20h20L12 2z" />}
                              {effectiveShape === 'rhombus' && <path d="M12 2l10 10-10 10L2 12z" />}
                              {effectiveShape === 'square' && <rect x="2" y="2" width="20" height="20" />}
                              {effectiveShape === 'rounded' && <rect x="2" y="2" width="20" height="20" rx="6" />}
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className="text-[0.6rem] font-black text-white/40 tracking-[0.2em] uppercase">VOCÊ</span>
                    </div>
                  )
                })()}

                <span className="text-white font-extrabold text-base min-w-[3.5rem] text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {time.toFixed(1)}s
                </span>
              </div>
            </div>

            {/* ── STATUS SECTOR: Health & Fury ── */}
            <div className="status-sector flex flex-col items-center gap-3 shrink-0 py-1">
              <HealthBar 
                current={health} 
                max={playerData.maxHealth} 
                theme={playerData.settings.theme as any} 
              />
              <FuryBar 
                progress={furyProgress} 
                isActive={isFuryActive} 
                mode={furyMode} 
                theme={playerData.settings.theme} 
              />
            </div>

          {/* ── GAME CANVAS: Flexes to fill remaining space ── */}
          <div className="game-column flex-1 min-h-0 flex items-center justify-center">
            <div className="relative w-full max-w-[640px] max-h-full aspect-square
                            rounded-2xl overflow-hidden border border-white/5
                            shadow-[0_0_40px_rgba(0,0,0,0.5)]">
              <GameView
                ref={gameViewRef}
                onCoinCollect={(amt) => setCoinsInRound(prev => prev + amt)}
                onFuryUpdate={setFuryProgress}
                onFuryActiveChange={(active, mode) => {
                  setIsFuryActive(active)
                  setFuryMode(mode)
                }}
                onHit={(dmg) => {
                  setHealth(prev => {
                    const nh = Math.max(0, prev - dmg)
                    if (nh <= 0) {
                      setTimeout(handleGameOver, 10)
                    }
                    return nh
                  })
                }}
                onHeal={(amt: number) => setHealth(prev => Math.min(playerData.maxHealth, prev + amt))}
                onTimeUpdate={handleTimeUpdate}
                health={health}
                maxHealth={playerData.maxHealth}
                appearance={playerData.settings}
                furyStats={playerData.furyStats}
                coinStats={playerData.coinStats}
              />
              {/* Tap layer for swap */}
              {!isGameOver && (
                <div
                  className="absolute inset-0 z-20 cursor-pointer touch-none"
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    if (e.cancelable) e.preventDefault()
                    gameViewRef.current?.triggerSwap()
                  }}
                />
              )}
            </div>
          </div>

          {/* ── HUD BOTTOM: Skills Only (HP moved to status sector) ── */}
          <div className="hud-column flex flex-col items-center gap-4 shrink-0 pb-4">

            {/* Skill Buttons */}
            {playerData.equippedSkills.length > 0 && (
              <div className="skill-row flex items-center justify-center gap-4">
                {playerData.equippedSkills.map(id => {
                  const isActive = activeSkills[id]
                  const cd = cooldowns[id] || 0
                  const casting = isCasting === id
                  const skillDef = SKILLS.find(s => s.id === id)

                  return (
                    <button
                      key={id}
                      className={`skill-btn relative w-14 h-14 rounded-2xl bg-[var(--theme-bgLight)] border cursor-pointer
                                  flex items-center justify-center text-2xl
                                  transition-all duration-200
                                  active:scale-90 shadow-lg
                                  ${isActive ? 'skill-active' : 'border-[var(--theme-border)]'}
                                  ${cd > 0 ? 'skill-cd' : ''}
                                  ${casting ? 'skill-casting' : ''}
                                `}
                      onPointerDown={e => e.stopPropagation()}
                      onClick={() => useSkill(id)}
                    >
                      <span className="skill-icon drop-shadow-md select-none flex items-center justify-center w-8 h-8" 
                            style={{ filter: playerData.settings.theme === 'sky' ? 'brightness(0.9) contrast(1.2)' : 'none' }}>
                        {skillDef && Icons[skillDef.icon as keyof typeof Icons] 
                          ? React.createElement(Icons[skillDef.icon as keyof typeof Icons], { className: "w-full h-full" })
                          : <Icons.Help className="w-full h-full opacity-20" />
                        }
                      </span>
                      {cd > 0 && (
                        <div className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center text-xs font-black text-neon-blue">
                          {Math.ceil(cd)}s
                        </div>
                      )}
                      {casting && (
                        <div 
                          className="absolute -bottom-1 left-0 h-0.5 bg-neon-blue rounded animate-cast-bar" 
                          style={{ animationDuration: SKILLS.find(s => s.id === id)?.getCast(playerData.unlockedSkills[id]?.level || 1) }}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* ═══ GAME OVER OVERLAY ═══ */}
          {isGameOver && (
            <div className="absolute inset-0 z-30 bg-bg/90 backdrop-blur-sm flex items-center justify-center animate-fade-in">
              <div className="flex flex-col items-center gap-6 px-8 py-10 max-w-sm w-full">
                <h2 className="text-neon-gradient text-4xl font-black tracking-[0.15em] text-center">
                  FIM DE JOGO
                </h2>
                <div className="flex flex-col items-center gap-1 text-white/70 text-sm">
                  <p className="m-0">Sobreviveu: <span className="text-white font-bold">{time.toFixed(1)}s</span></p>
                  <p className="m-0 flex items-center gap-2">Moedas: <span className="text-gold font-bold flex items-center gap-1.5"><Icons.Coin className="w-4 h-4" /> {coinsInRound}</span></p>
                </div>

                {!adUsed && coinsInRound > 0 && (
                  <AdSlot type="rewarded" onAction={handleDoubleCoins} />
                )}

                <button
                  className="glow-green w-full py-4 rounded-2xl bg-neon-green text-bg border-none
                             font-sans text-base font-black tracking-[3px] cursor-pointer
                             flex items-center justify-center transition-all duration-200
                             hover:-translate-y-0.5 active:scale-[0.97]"
                  onPointerDown={e => e.stopPropagation()}
                  onClick={handleRestart}
                >
                  VOLTAR AO MENU
                </button>
              </div>
            </div>
          )}

          {/* ═══ BACK CONFIRMATION MODAL ═══ */}
          {showBackConfirm && (
            <div className="absolute inset-0 z-40 bg-bg/95 backdrop-blur-md flex items-center justify-center animate-fade-in p-6">
              <div className="glass neon-border-red rounded-3xl p-8 max-w-sm w-full flex flex-col items-center gap-6 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                <div className="w-16 h-16 rounded-full bg-red/10 flex items-center justify-center animate-pulse p-4">
                  <Icons.Warning className="w-full h-full text-red" />
                </div>
                <div className="text-center flex flex-col gap-2">
                  <h3 className="text-white text-xl font-black tracking-wider m-0">VOLTAR AO MENU?</h3>
                  <p className="text-white/60 text-sm leading-relaxed m-0">
                    Você perderá <span className="text-red font-bold">3/4</span> das moedas conquistadas nesta rodada.
                  </p>
                  <div className="bg-white/5 rounded-xl py-3 px-4 mt-2 border border-white/5">
                    <span className="text-gold font-black text-lg flex items-center gap-1.5 justify-center">
                      {Math.floor(coinsInRound / 4)} 
                      <Icons.Coin className="w-5 h-5 ml-1" />
                    </span>
                  </div>
                </div>

                <div className="flex flex-col w-full gap-3">
                  <button
                    className="w-full py-4 rounded-2xl bg-red text-white border-none
                               font-black tracking-[2px] cursor-pointer transition-all
                               hover:brightness-110 active:scale-95"
                    onPointerDown={e => e.stopPropagation()}
                    onClick={confirmBack}
                  >
                    CONFIRMAR E PERDER
                  </button>
                  <button
                    className="w-full py-4 rounded-2xl bg-white/5 text-white/70 border border-white/10
                               font-black tracking-[1px] cursor-pointer transition-all
                               hover:bg-white/10 active:scale-95"
                    onPointerDown={e => e.stopPropagation()}
                    onClick={cancelBack}
                  >
                    CONTINUAR JOGANDO
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}

export default App
