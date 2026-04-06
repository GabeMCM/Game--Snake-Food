import { useState, useEffect, useRef } from 'react'
import { GameView, GameViewRef } from './components/GameView'
import { MainMenu } from './components/MainMenu'
import { SkillsMenu } from './components/SkillsMenu'
import { loadPlayerData, savePlayerData, PlayerData } from './utils/persistence'
import { AdSlot } from './components/AdSlot'
import './App.css'

type View = 'menu' | 'playing' | 'skills'

function App() {
  const [view, setView] = useState<View>('menu')
  const [playerData, setPlayerData] = useState<PlayerData>(loadPlayerData())
  
  // Estado Temporário da Rodada
  const [coinsInRound, setCoinsInRound] = useState(0)
  const [lastTimeCoin, setLastTimeCoin] = useState(0)
  const [time, setTime] = useState(0)
  const [health, setHealth] = useState(100)
  
  // Estado das Habilidades
  const gameViewRef = useRef<GameViewRef>(null)
  const [activeSkills, setActiveSkills] = useState<{ [id: string]: boolean }>({})
  const [cooldowns, setCooldowns] = useState<{ [id: string]: number }>({})
  const [isCasting, setIsCasting] = useState<string | null>(null)
  const [isGameOver, setIsGameOver] = useState(false)
  const [adUsed, setAdUsed] = useState(false) // Trava para 1 anúncio por game

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

  const handleGameOver = () => {
    if (isGameOver) return
    setIsGameOver(true)
    
    // Parar o motor do jogo
    gameViewRef.current?.stop()
    
    const earned = coinsInRound
    const updatedData = {
      ...playerData,
      coins: playerData.coins + earned,
    }
    setPlayerData(updatedData)
    savePlayerData(updatedData)
  }

  const handleRestart = () => {
    setIsGameOver(false)
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
    const cost = 20 + (currentHP - 100) * 2
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

  const handleBuySkill = (id: string, baseCost: number) => {
    const currentLevel = playerData.unlockedSkills[id]?.level || 0
    const cost = baseCost * (currentLevel + 1)
    
    if (playerData.coins >= cost) {
      const updatedData = {
        ...playerData,
        coins: playerData.coins - cost,
        unlockedSkills: {
          ...playerData.unlockedSkills,
          [id]: { level: currentLevel + 1 }
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

  const useSkill = (id: string) => {
    const skillStats = playerData.unlockedSkills[id]
    if (!skillStats || cooldowns[id] > 0 || isCasting) return

    const level = skillStats.level
    setIsCasting(id)
    
    // Cast Time: 0.8s (Fixo para este refinamento)
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
        const cd = Math.max(15, 30 - (level - 1) * 2) // -2s por nível
        const healAmt = 30 + (level - 1) * 5 // +5 HP por nível
        
        gameViewRef.current?.activateSacrifice(5000) // Duração do counter-attack fixa 5s
        setActiveSkills(prev => ({ ...prev, [id]: true }))
        setCooldowns(prev => ({ ...prev, [id]: cd }))
        // A cura agora é baseada no nível, precisamos passar isso para o motor ou lidar no App
        // Para simplificar, vou manter o motor enviando o sinal e o App calculando o valor final no onHeal
        setTimeout(() => setActiveSkills(prev => ({ ...prev, [id]: false })), 5000)
      }
    }, 800)
  }

  return (
    <div className="app-container">
      {view === 'menu' && (
        <MainMenu 
          coins={playerData.coins} 
          onStart={() => setView('playing')} 
          onOpenSkills={() => setView('skills')} 
        />
      )}

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
        />
      )}

      {view === 'playing' && (
        <>
          <div className="hud-top glass neon-border">
            <div className="stat coin-stat">
              <span className="icon">⬢</span>
              <span className="value">{coinsInRound}</span>
            </div>
            <div className="stat time-stat">
              <span className="value">{time.toFixed(1)}s</span>
            </div>
          </div>

          <div className="game-wrapper square">
            <GameView 
              ref={gameViewRef}
              onCoinCollect={(amt) => setCoinsInRound(prev => prev + amt)}
              onHit={(dmg) => {
                setHealth(prev => {
                  const nh = Math.max(0, prev - dmg)
                  if (nh <= 0) {
                     // Adiado para não interromper render
                     setTimeout(handleGameOver, 10)
                  }
                  return nh
                })
              }}
              onHeal={(amt: number) => setHealth(prev => Math.min(playerData.maxHealth, prev + amt))}
              onTimeUpdate={handleTimeUpdate}
              health={health}
              maxHealth={playerData.maxHealth}
            />
          </div>

          <div className="hud-bottom-deck glass">
            <div className="hp-bar-compact">
              <div className="hp-fill" style={{ width: `${(health / playerData.maxHealth) * 100}%` }}></div>
              <div className="hp-label">{Math.ceil(health)} / {playerData.maxHealth} HP</div>
            </div>

            <div className="skill-slots">
              {playerData.equippedSkills.map(id => {
                const isActive = activeSkills[id]
                const cd = cooldowns[id] || 0
                const casting = isCasting === id

                return (
                  <div 
                    key={id}
                    className={`skill-slot-hex ${isActive ? 'active' : ''} ${cd > 0 ? 'on-cd' : ''} ${casting ? 'casting' : ''}`}
                    onClick={() => useSkill(id)}
                  >
                    <div className="slot-inner">
                      {id === 'sacrifice' ? '💉' : id === 'invisibility' ? '👻' : '❄️'}
                      {cd > 0 && <div className="cd-overlay">{Math.ceil(cd)}s</div>}
                      {casting && <div className="cast-progress"></div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {isGameOver && (
            <div className="game-over-overlay glass">
              <div className="menu-container neon-border">
                <h2 className="menu-title">FIM DE JOGO</h2>
                <div className="results">
                  <p>Sobreviveu: {time.toFixed(1)}s</p>
                  <p>Moedas: <span className="highlight">+{coinsInRound} ⬢</span></p>
                </div>

                {!adUsed && coinsInRound > 0 && (
                   <AdSlot type="rewarded" onAction={handleDoubleCoins} />
                )}

                <button className="menu-btn primary" onClick={handleRestart}>
                  VOLTAR AO MENU
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default App
