import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { GameView, GameViewRef } from './components/GameView'
import { SF_UI } from './utils/ui-system'
import { MainMenu } from './components/MainMenu'
import { SkillsMenu } from './components/SkillsMenu'
import { AppearanceMenu } from './components/AppearanceMenu'
import { SettingsMenu } from './components/SettingsMenu'
import { loadPlayerData, savePlayerData, PlayerData } from './utils/persistence'
import { AdSlot } from './components/AdSlot'
import { applyThemeToCSS, THEMES } from './utils/themes'
import { Icons } from './components/Icons'
import { HealthBar } from './components/HealthBar'
import { FuryBar } from './components/FuryBar'
import { GameResults } from './components/GameResults'
import { SKILLS, SKILL_RECHARGE_TYPES, getSkillStatValue } from './utils/skills'
import { 
  getRequiredExpForNextLevel, 
  getHealthBonusForLevel, 
  getCoinMultiplierForLevel, 
  calculateSessionExp,
  SKILL_USE_EXP_BONUS,
  getSkillRequiredExpForNextLevel
} from './utils/progression'
import { supabase } from './utils/supabase'
import { LoginModal } from './components/LoginModal'
import { NicknameModal } from './components/NicknameModal'
import { RankingMenu } from './components/RankingMenu'
import { APP_CONFIG } from './utils/config'
import { AuthOnboarding } from './components/AuthOnboarding'
import './App.css'

type View = 'menu' | 'playing' | 'skills' | 'appearance' | 'settings' | 'ranking'

const renderHex = (hex: any) => {
  if (typeof hex === 'object' && hex !== null) return `#${hex.primary.toString(16).padStart(6, '0')}`
  const h = typeof hex === 'number' ? hex : 0xFFFFFF
  return `#${h.toString(16).padStart(6, '0')}`
}

function App() {
  const [view, setView] = useState<View>('menu')
  const [playerData, setPlayerData] = useState<PlayerData>(loadPlayerData())
  const [hasFuryInSession, setHasFuryInSession] = useState(false)
  const [sessionExpRealTime, setSessionExpRealTime] = useState(0)
  const [skillUsages, setSkillUsages] = useState<{ [id: string]: number }>({})
  const [levelUpEvents, setLevelUpEvents] = useState<{ [id: string]: boolean }>({})
  
  // ── AUTH & SESSION ──
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showNicknameSetup, setShowNicknameSetup] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem('sf_onboarding_hidden') !== 'true'
  })

  // ── PERSISTÊNCIA CENTRALIZADA ──
  useEffect(() => {
    if (!supabase) {
      setIsAuthLoading(false);
      return;
    }

    let isMounted = true;

    // Escuta mudanças na autenticação
    const initAuth = async () => {
      console.log("🔍 [Auth] Inicializando sessão...");
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) console.error("❌ [Auth] Erro ao buscar sessão inicial:", error);

      const hasHash = window.location.hash.includes('access_token') || 
                      window.location.hash.includes('error');

      if (isMounted) {
        if (session) {
          console.log("✅ [Auth] Sessão recuperada com sucesso.");
          setSession(session);
          await fetchProfile(session.user.id);
          setIsAuthLoading(false);
        } else if (!hasHash) {
          console.log("ℹ️ [Auth] Nenhuma sessão e nenhum hash detectado.");
          setSession(null);
          setIsAuthLoading(false);
        } else {
          console.log("⏳ [Auth] Hash detectado. Aguardando processamento...");
          // Fallback: Se o hash existir mas não o evento não disparar em 3s, tenta manual
          setTimeout(async () => {
            if (isMounted && !session) {
              console.log("🔄 [Auth] Tentativa de recuperação forçada via API...");
              const { data: { session: retrySession } } = await supabase.auth.getSession();
              if (retrySession) {
                setSession(retrySession);
                await fetchProfile(retrySession.user.id);
              }
              setIsAuthLoading(false);
            }
          }, 3000);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      console.log(`🔄 [Auth] Evento recebido: ${event}`);
      
      if (isMounted) {
        setSession(session);
        
        if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
          console.log("👤 [Auth] Usuário identificado, buscando perfil...");
          setIsAuthLoading(true);
          await fetchProfile(session.user.id);
          setIsAuthLoading(false);
          
          if (window.location.hash.includes('access_token')) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log("👋 [Auth] Usuário saiu.");
          setProfile(null);
          setPlayerData(loadPlayerData());
          setIsAuthLoading(false);
        } else if (!session && !window.location.hash.includes('access_token')) {
          // Se não há sessão e não estamos em meio a um login, libera o loading
          setIsAuthLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    }
  }, [supabase])

  // Removido useEffect redundante de [session] para evitar loops
  
  const fetchProfile = async (userId: string) => {
    console.log("📡 [Auth] Buscando perfil do usuário:", userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // Se o erro for PGRST116 (nenhum registro encontrado), criamos um novo perfil
    if (error && (error as any).code === 'PGRST116') {
      console.log("🆕 [Auth] Novo usuário detectado. Criando perfil...");
      const { data: newData, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          nickname: session?.user?.user_metadata?.full_name?.split(' ')[0] || `SF_User_${userId.substring(0, 5)}`,
          avatar_url: session?.user?.user_metadata?.avatar_url || session?.user?.user_metadata?.picture,
          level: 1,
          exp: 0,
          coins: 0,
          best_time: 0,
          unlocked_skills: {},
          equipped_skills: [],
          unlocked_cosmetics: ['color_electric', 'shape_rounded', 'theme_neon'],
          settings: loadPlayerData().settings
        })
        .select()
        .single()

      if (insertError) {
        console.error("❌ [Auth] Erro ao criar perfil:", insertError);
        return
      }

      if (newData) {
        setProfile(newData)
        setShowNicknameSetup(true)
        const newPlayerData = {
            ...loadPlayerData(),
            coins: 0,
            level: 1,
            exp: 0,
            unlockedSkills: {},
            equippedSkills: [],
            lastHighScore: 0
        }
        setPlayerData(newPlayerData)
      }
      return
    }

    if (error) {
      console.error("❌ [Auth] Erro ao buscar perfil:", error);
      return
    }

    if (data) {
      console.log("✅ [Auth] Perfil carregado com sucesso:", data.nickname);
      setProfile(data)
      
      if (!data.nickname || data.nickname.startsWith('SF_User_')) {
        setShowNicknameSetup(true)
      } else {
        // Lógica de Reset Total: Dados da Nuvem vencem
        const cloudData: PlayerData = {
          ...loadPlayerData(),
          coins: data.coins || 0,
          level: data.level || 1,
          exp: data.exp || 0,
          unlockedSkills: data.unlocked_skills || {},
          equippedSkills: data.equipped_skills || [],
          lastHighScore: data.best_time || 0,
          unlockedCosmetics: data.unlocked_cosmetics || ['color_electric', 'shape_rounded', 'theme_neon'],
          settings: data.settings || loadPlayerData().settings
        }

        setPlayerData(cloudData)
        setBestTime(cloudData.lastHighScore)
      }
    }
  }

  useEffect(() => {
    // Se logado, salva na nuvem. Se não, salva localmente.
    if (session?.user && profile?.nickname && !profile.nickname.startsWith('SF_User_')) {
      syncWithCloud(playerData)
    } else if (!session) {
      savePlayerData(playerData)
    }
  }, [playerData, session, profile])

  const syncWithCloud = async (data: PlayerData) => {
    if (!session?.user) return

    await supabase
      .from('profiles')
      .update({
        level: data.level,
        exp: data.exp,
        coins: data.coins,
        best_time: Math.max(data.lastHighScore, bestTime),
        unlocked_skills: data.unlockedSkills,
        equipped_skills: data.equippedSkills,
        unlocked_cosmetics: data.unlockedCosmetics,
        settings: data.settings,
        updated_at: new Date()
      })
      .eq('id', session.user.id)
  }

  const handleLogout = async () => {
    console.log("👋 [Auth] Iniciando desconexão manual...");
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
    setPlayerData(loadPlayerData())
    setShowAuthModal(false)
  }
  
  // ── ESTADOS DE PARTIDA (ESSENCIAIS) ──
  const [coinsInRound, setCoinsInRound] = useState(0)
  const [lastTimeCoin, setLastTimeCoin] = useState(0)
  const [time, setTime] = useState(0)
  const [health, setHealth] = useState(() => 100 + getHealthBonusForLevel(playerData.level))
  const [bestTime, setBestTime] = useState(playerData.lastHighScore)
  const [furyProgress, setFuryProgress] = useState(0)
  const [isFuryActive, setIsFuryActive] = useState(false)
  const [furyMode, setFuryMode] = useState('')
  const gameViewRef = useRef<GameViewRef>(null)
  const [activeSkills, setActiveSkills] = useState<{ [id: string]: boolean }>({})
  const [cooldowns, setCooldowns] = useState<{ [id: string]: number }>({})
  const [isCasting, setIsCasting] = useState<string | null>(null)
  const [isGameOver, setIsGameOver] = useState(false)
  const [adUsed, setAdUsed] = useState(false) 
  const [furyOccurrenceCount, setFuryOccurrenceCount] = useState(0)
  const [baitConsumptionCount, setBaitConsumptionCount] = useState<{ [id: string]: number }>({})
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [sacrificeHits, setSacrificeHits] = useState(0)
  const [sacrificeLockout, setSacrificeLockout] = useState(0)
  const [lastResults, setLastResults] = useState<any>(null)
  const [isWatchingAd, setIsWatchingAd] = useState(false)
  const [adProgress, setAdProgress] = useState(0)

  // Status Dinâmicos
  const maxHP = 100 + getHealthBonusForLevel(playerData.level)
  const coinMult = getCoinMultiplierForLevel(playerData.level)

  const handleStart = () => {
    setHealth(maxHP)
    setTime(0)
    setCoinsInRound(0)
    setFuryProgress(0)
    setIsFuryActive(false)
    setCooldowns({})
    setActiveSkills({})
    setIsCasting(null)
    setBaitConsumptionCount({})
    setFuryOccurrenceCount(0)
    setSkillUsages({})
    setLevelUpEvents({})
    setView('playing')
  }
  
  // SAFETY SYNC: Garante que a vida esteja cheia ao iniciar o jogo
  useEffect(() => {
    if (view === 'playing' && !isGameOver) {
      setHealth(maxHP)
    }
  }, [view, maxHP, isGameOver])

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

  // ── APLICAÇÃO DE TEMA (SINCRONIZADA) ──
  // Usamos useLayoutEffect para garantir que as variáveis CSS sejam injetadas 
  // ANTES da primeira pintura da tela, evitando o bug do design "quebrado" no refresh.
  useLayoutEffect(() => {
    applyThemeToCSS(playerData.settings.theme)
  }, [playerData.settings.theme])

  // Timer de Cooldown (Habilidades de TEMPO)
  useEffect(() => {
    const timer = setInterval(() => {
      setCooldowns(prev => {
        const next = { ...prev }
        let changed = false
        Object.keys(next).forEach(id => {
          const skill = SKILLS.find(s => s.id === id)
          if (skill?.rechargeType === SKILL_RECHARGE_TYPES.TIME && next[id] > 0) {
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
    
    // ── PROCESSAMENTO DE RECOMPENSAS ──
    const sessionExp = calculateSessionExp(time, hasFuryInSession)
    const earnedCoins = Math.floor(coinsInRound * coinMult)
    const newBestTime = Math.max(time, playerData.lastHighScore)
    
    setBestTime(newBestTime)
    
    // Atualizar Player Data com ganhos
    setPlayerData(prev => {
      let newLevel = prev.level
      let newExp = prev.exp + sessionExp
      let req = getRequiredExpForNextLevel(newLevel)
      
      while (newExp >= req) {
        newExp -= req
        newLevel++
        req = getRequiredExpForNextLevel(newLevel)
      }

      const skills = { ...prev.unlockedSkills }
      const skillExpGain = Math.floor(sessionExp * 0.5)
      
      prev.equippedSkills.forEach(id => {
        if (skills[id]) {
          let sLevel = skills[id].level
          let sExp = skills[id].exp + skillExpGain
          let sReq = getSkillRequiredExpForNextLevel(sLevel)
          
          while (sExp >= sReq) {
            sExp -= sReq
            sLevel++
            sReq = getSkillRequiredExpForNextLevel(sLevel)
          }
          skills[id] = { level: sLevel, exp: sExp }
        }
      })

      return {
        ...prev,
        coins: prev.coins + earnedCoins,
        lastHighScore: newBestTime,
        level: newLevel,
        exp: newExp,
        unlockedSkills: skills
      }
    })

    setLastResults({
      time,
      coins: earnedCoins,
      exp: sessionExp,
      isNewBest: time > playerData.lastHighScore
    })
  }

  useEffect(() => {
    if (view === 'playing') {
      const exp = calculateSessionExp(time, hasFuryInSession)
      setSessionExpRealTime(exp)
    }
  }, [time, view, hasFuryInSession])

  useEffect(() => {
    if (isFuryActive) {
      if (!hasFuryInSession) setHasFuryInSession(true)
      setFuryOccurrenceCount(prev => prev + 1)
    }
  }, [isFuryActive])

  // Lógica de Trava de Recarga do Sacrifício
  useEffect(() => {
    if (sacrificeLockout > 0 && !isGameOver) {
      const timer = setInterval(() => {
        setSacrificeLockout(prev => Math.max(0, prev - 100))
      }, 100)
      return () => clearInterval(timer)
    }
  }, [sacrificeLockout, isGameOver])

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
    if (adUsed || isWatchingAd) return
    
    setIsWatchingAd(true)
    setAdProgress(0)

    const duration = APP_CONFIG.ADS.SIMULATED_DURATION_MS
    const interval = 50
    const step = (interval / duration) * 100

    const timer = setInterval(() => {
      setAdProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer)
          finalizeAdReward()
          return 100
        }
        return prev + step
      })
    }, interval)
  }

  const finalizeAdReward = () => {
    setAdUsed(true)
    setIsWatchingAd(false)
    
    const earned = coinsInRound
    const updatedData = {
      ...playerData,
      coins: playerData.coins + earned,
    }
    setPlayerData(updatedData)
    savePlayerData(updatedData)
    setCoinsInRound(earned * 2)
  }

  const handleUpgradeCoins = () => {
    // Obsoleto: Substituído por progressão automática por nível
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
    const cost = baseCost
    
    if (playerData.coins >= cost) {
      const updatedData = {
        ...playerData,
        coins: playerData.coins - cost,
        unlockedSkills: {
          ...playerData.unlockedSkills,
          [id]: { 
            level: 1,
            exp: 0
          }
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

  const handleBaitConsumed = () => {
    setBaitConsumptionCount(prev => {
        const next = { ...prev }
        playerData.equippedSkills.forEach(id => {
            const skill = SKILLS.find(s => s.id === id)
            if (skill?.rechargeType === SKILL_RECHARGE_TYPES.BAIT) {
                const current = next[id] || 0
                if (current > 0) {
                    next[id] = Math.max(0, current - 1)
                }
            }
        })
        return next
    })
  }

  const useSkill = (id: string) => {
    const currentCd = cooldowns[id] || 0
    if (playerData.unlockedSkills[id] && currentCd === 0 && isCasting === null) {
      const skillDef = SKILLS.find(s => s.id === id)
      if (!skillDef || skillDef.isAutomatic) return

      // Trava extra para o Sacrifício (Recarga por Mortes)
      if (skillDef.rechargeType === SKILL_RECHARGE_TYPES.DEATHS) {
        if (sacrificeHits < skillDef.rechargeValue(playerData.unlockedSkills[id].level)) return
        if (sacrificeLockout > 0) return
      }

      // Trilha bônus de EXP por uso
      setSkillUsages(prev => ({
        ...prev,
        [id]: (prev[id] || 0) + 1
      }))

      setIsCasting(id)
      
      const skillStats = playerData.unlockedSkills[id]
      const level = skillStats.level
      const castStr = skillDef.getCast(level)
      const castTimeMs = parseFloat(castStr) * 1000
      
      setTimeout(() => {
        setIsCasting(null)
        
        if (id === 'invisibility') {
          const duration = getSkillStatValue(id, 'duration', level) * 1000
          gameViewRef.current?.activateInvisibility(duration)
          setActiveSkills(prev => ({ ...prev, [id]: true }))
          setTimeout(() => setActiveSkills(prev => ({ ...prev, [id]: false })), duration)
        }

        if (id === 'frost_aura') {
          const duration = getSkillStatValue(id, 'duration', level) * 1000
          gameViewRef.current?.toggleFrostAura(true)
          setActiveSkills(prev => ({ ...prev, [id]: true }))
          setTimeout(() => {
            gameViewRef.current?.toggleFrostAura(false)
            setActiveSkills(prev => ({ ...prev, [id]: false }))
          }, duration)
        }

        if (id === 'phantom_block') {
          const duration = getSkillStatValue(id, 'duration', level) * 1000
          const length = getSkillStatValue(id, 'extra', level)
          gameViewRef.current?.activatePhantomBlock(duration, length)
          setActiveSkills(prev => ({ ...prev, [id]: true }))
          setTimeout(() => setActiveSkills(prev => ({ ...prev, [id]: false })), duration)
        }

        if (id === 'clones') {
          const duration = getSkillStatValue(id, 'duration', level) * 1000
          const count = getSkillStatValue(id, 'extra', level)
          gameViewRef.current?.activateClones(duration, count)
          setActiveSkills(prev => ({ ...prev, [id]: true }))
          setTimeout(() => setActiveSkills(prev => ({ ...prev, [id]: false })), duration)
        }

        if (id === 'gain_zone') {
          const duration = getSkillStatValue(id, 'duration', level) * 1000
          const radius = getSkillStatValue(id, 'extra', level)
          gameViewRef.current?.activateGainZone(duration, radius)
          setActiveSkills(prev => ({ ...prev, [id]: true }))
          setTimeout(() => setActiveSkills(prev => ({ ...prev, [id]: false })), duration)
        }

        if (id === 'explosive_bait') {
          const duration = getSkillStatValue(id, 'duration', level) * 1000
          const slowAmt = getSkillStatValue(id, 'extra', level)
          gameViewRef.current?.activateExplosiveBait(duration, slowAmt)
          setActiveSkills(prev => ({ ...prev, [id]: true }))
          setTimeout(() => setActiveSkills(prev => ({ ...prev, [id]: false })), duration)
        }

        if (id === 'intangibility') {
          const duration = getSkillStatValue(id, 'duration', level) * 1000
          gameViewRef.current?.activateIntangibility(duration)
          setActiveSkills(prev => ({ ...prev, [id]: true }))
          setTimeout(() => setActiveSkills(prev => ({ ...prev, [id]: false })), duration)
        }

        if (id === 'sacrifice') {
          const duration = getSkillStatValue(id, 'duration', level) * 1000
          const healPercent = getSkillStatValue(id, 'extra', level)
          gameViewRef.current?.activateSacrifice(duration, healPercent)
          setActiveSkills(prev => ({ ...prev, [id]: true }))
          setSacrificeHits(0)
          setSacrificeLockout(15000) // Travado em ms agora (era 15)
          setTimeout(() => setActiveSkills(prev => ({ ...prev, [id]: false })), duration)
        }

        setCooldowns(prev => ({ ...prev, [id]: skillDef.rechargeValue(level) }))
      }, castTimeMs)
    }
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
          level={playerData.level}
          exp={playerData.exp}
          isAuthenticated={!!session}
          userNickname={profile?.nickname || session?.user?.user_metadata?.full_name || 'Explorador'}
          avatarUrl={profile?.avatar_url || session?.user?.user_metadata?.avatar_url || session?.user?.user_metadata?.picture}
          onStart={() => setView('playing')} 
          onOpenSkills={() => setView('skills')} 
          onOpenAppearance={() => setView('appearance')}
          onOpenSettings={() => setView('settings')}
          onOpenProfile={() => setShowAuthModal(true)}
          onOpenRanking={() => setView('ranking')}
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

      {/* ═══ SETTINGS MENU ═══ */}
      {view === 'settings' && (
        <SettingsMenu
          settings={playerData.settings}
          onBack={() => setView('menu')}
          onToggleSetting={handleEquipCosmetic}
        />
      )}

      {/* ═══ SKILLS MENU ═══ */}
      {view === 'skills' && (
        <SkillsMenu
          coins={playerData.coins}
          level={playerData.level}
          exp={playerData.exp}
          onBack={() => setView('menu')}
          unlockedSkills={playerData.unlockedSkills}
          equippedSkills={playerData.equippedSkills}
          onBuySkill={handleBuySkill}
          onToggleEquip={handleToggleEquip}
          settings={playerData.settings}
        />
      )}

      {/* ═══ PLAYING SCREEN ═══ */}
      {view === 'playing' && (
        <div className="playing-layout w-full h-full flex flex-col p-2 gap-2 relative overflow-hidden">
          
          {/* PLAYER EXP BAR (TOP THIN LINE) */}
          {(() => {
             const currentLevel = playerData.level
             const totalExp = playerData.exp + sessionExpRealTime
             const reqExp = getRequiredExpForNextLevel(currentLevel)
             const progress = Math.min(100, (totalExp / reqExp) * 100)
             const isLevelUp = totalExp >= reqExp
             
             return (
               <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] bg-white/5 z-50 pointer-events-none overflow-visible"
                    style={{ width: 'min(640px, calc(100% - 16px))' }}>
                 <div className={`h-full bg-neon-blue shadow-[0_0_8px_rgba(30,144,255,0.8)] transition-all duration-300
                                  ${isLevelUp ? 'animate-player-bar-flash' : ''}`}
                      style={{ width: `${progress}%` }} />
               </div>
             )
          })()}

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

                <span className="text-white font-extrabold text-base min-w-[3.5rem] text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {time.toFixed(1)}s
                </span>
              </div>
            </div>

            {/* ── STATUS SECTOR: Health & Fury ── */}
            <div className="status-sector flex flex-col items-center gap-3 shrink-0 py-1">
              <HealthBar 
                current={health} 
                max={maxHP} 
                theme={playerData.settings.theme as any} 
              />
              <FuryBar 
                progress={furyProgress} 
                isActive={isFuryActive} 
                mode={furyMode} 
                theme={playerData.settings.theme} 
              />
            </div>

          <div className="game-column flex-1 min-h-0 flex items-center justify-center relative">

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
                  if (isGameOver) return
                  setHealth(prev => {
                    const nh = Math.max(0, prev - dmg)
                    if (nh < prev && nh > 0) {
                      // É um reset da cobra/dano
                      if (sacrificeLockout === 0) {
                        setSacrificeHits(h => Math.min(3, h + 1))
                      }
                    }
                    if (nh <= 0) {
                      setTimeout(handleGameOver, 10)
                    }
                    return nh
                  })
                }}
                onHeal={(amt: number) => setHealth(prev => Math.min(maxHP, prev + amt))}
                onTimeUpdate={handleTimeUpdate}
                onBaitConsumed={handleBaitConsumed}
                health={health}
                maxHealth={maxHP}
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

          {/* ── HUD BOTTOM: Skills Only ── */}
          <div className="hud-column flex flex-col items-center gap-4 shrink-0 pb-4">

            {/* Skill Buttons with Progress Rings */}
            {playerData.equippedSkills.length > 0 && (
              <div className="skill-row flex items-center justify-center gap-4">
                {playerData.equippedSkills.map(id => {
                  const skillDef = SKILLS.find(s => s.id === id)
                  const sData = playerData.unlockedSkills[id]
                  if (!skillDef || !sData) return null

                  const isActive = activeSkills[id]
                  const casting = isCasting === id
                  
                  // Calc real-time skill exp
                  const usages = skillUsages[id] || 0
                  const passiveGain = Math.floor(sessionExpRealTime * 0.5)
                  const totalSkillExp = sData.exp + passiveGain + (usages * 15)
                  const reqSkillExp = getSkillRequiredExpForNextLevel(sData.level)
                  const skillProgress = Math.min(100, (totalSkillExp / reqSkillExp) * 100)
                  const isSkillLevelUp = totalSkillExp >= reqSkillExp

                  // Recharge visual calculation
                  let rechargePercent = 0
                  const currentVal = cooldowns[id] || 0
                  if (skillDef.rechargeType === SKILL_RECHARGE_TYPES.TIME) {
                    rechargePercent = (currentVal / skillDef.rechargeValue(sData.level)) * 100
                  } else if (skillDef.rechargeType === SKILL_RECHARGE_TYPES.BAIT) {
                    rechargePercent = (currentVal / skillDef.rechargeValue(sData.level)) * 100
                  } else if (skillDef.rechargeType === SKILL_RECHARGE_TYPES.DEATHS) {
                    // Se estiver no lockout de 15s sem hits, mostra lockout. Senão, mostra progresso de hits.
                    if (sacrificeLockout > 0 && sacrificeHits === 0) {
                      rechargePercent = (sacrificeLockout / 15000) * 100
                    } else {
                      rechargePercent = (sacrificeHits / skillDef.rechargeValue(sData.level)) * 100
                      // Se chegou em 3/3, fica 0% (pronto). Invertemos para a máscara radial.
                      rechargePercent = Math.max(0, 100 - rechargePercent)
                    }
                  } else if (skillDef.rechargeType === SKILL_RECHARGE_TYPES.FURY) {
                    rechargePercent = (furyOccurrenceCount % 2 === 1) ? 50 : (currentVal > 0 ? 100 : 0)
                  }

                  return (
                    <button
                      key={id}
                      className={`skill-btn relative w-16 h-16 rounded-full bg-[var(--theme-bgLight)] border cursor-pointer
                                  flex items-center justify-center text-2xl
                                  transition-all duration-200
                                  active:scale-90 shadow-lg
                                  ${isActive ? 'skill-active' : 'border-white/5'}
                                  ${rechargePercent > 0 ? 'skill-cd' : ''}
                                  ${casting ? 'skill-casting' : ''}
                                  ${skillDef.isAutomatic ? 'cursor-default opacity-90' : ''}
                                `}
                      onPointerDown={e => e.stopPropagation()}
                      onClick={() => !skillDef.isAutomatic && useSkill(id)}
                    >
                      {/* Radial Progress Ring (EXP) */}
                      <svg className={`absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)] -rotate-90 pointer-events-none 
                                     ${isSkillLevelUp ? 'animate-skill-spin-glow' : ''}`} viewBox="0 0 100 100">
                        <circle 
                          cx="50" cy="50" r="46" 
                          fill="none" 
                          stroke={skillDef.color} 
                          strokeWidth="2"
                          strokeDasharray="289"
                          strokeDashoffset={289 - (289 * skillProgress / 100)}
                          strokeLinecap="round"
                          className="transition-all duration-500 opacity-60"
                        />
                      </svg>

                      {/* Recharge Radial Mask / Overlay */}
                      {rechargePercent > 0 && (
                        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                          <div 
                             className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
                             style={{
                               clipPath: `conic-gradient(transparent ${rechargePercent}%, black 0)`
                             }}
                          />
                        </div>
                      )}

                      <span className={`skill-icon drop-shadow-md select-none flex items-center justify-center w-8 h-8 
                                      ${rechargePercent > 0 ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}`} 
                            style={{ filter: playerData.settings.theme === 'sky' ? 'brightness(0.9) contrast(1.2)' : 'none' }}>
                        {React.createElement(Icons[skillDef.icon as keyof typeof Icons], { className: "w-full h-full" })}
                      </span>

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

          {/* ═══ GAME RESULTS OVERLAY (REPLACES OLD OVERLAY) ═══ */}
          {isGameOver && lastResults && (
            <GameResults 
               stats={lastResults}
               playerData={playerData}
               onRestart={handleRestart}
               onDoubleCoins={handleDoubleCoins}
               adUsed={adUsed}
            />
          )}

          {/* ═══ BACK CONFIRMATION MODAL ═══ */}
          {showBackConfirm && (
            <div className={`${SF_UI.effects.overlay}`}>
              <div className={`${SF_UI.layout.modal} ${SF_UI.effects.glowDanger} items-center text-center`}>
                <div className={`w-20 h-20 ${SF_UI.rounding.full} bg-red/10 flex items-center justify-center animate-pulse p-5 shadow-[0_0_30px_rgba(255,60,80,0.1)]`}>
                  <Icons.Warning className="w-full h-full text-red" />
                </div>
                
                <div className="flex flex-col gap-2">
                  <h3 className={`${SF_UI.typography.h2}`}>VOLTAR AO MENU?</h3>
                  <p className={`${SF_UI.typography.caption} leading-relaxed normal-case`}>
                    Você perderá <span className="text-red font-black">3/4</span> das moedas conquistadas nesta rodada.
                  </p>
                  
                  <div className={`bg-white/5 ${SF_UI.rounding.card} py-4 px-6 mt-4 border border-white/5 ${SF_UI.effects.glowAccent}`}>
                    <span className="text-[var(--theme-accent)] font-black text-2xl flex items-center gap-3 justify-center">
                      {Math.floor(coinsInRound / 4)} 
                      <Icons.Coin className="w-6 h-6" />
                    </span>
                    <span className={`${SF_UI.typography.label} mt-1 block`}>RECOMPENSA GARANTIDA</span>
                  </div>
                </div>

                <div className="flex flex-col w-full gap-4 mt-2">
                  <button
                    className={`${SF_UI.button.primary} !bg-red !text-white`}
                    onPointerDown={e => e.stopPropagation()}
                    onClick={confirmBack}
                  >
                    CONFIRMAR E PERDER
                  </button>
                  <button
                    className={`${SF_UI.button.secondary}`}
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
      {/* ═══ RANKING MENU ═══ */}
      {view === 'ranking' && (
        <RankingMenu onBack={() => setView('menu')} />
      )}

      {/* ═══ LOGIN / PROFILE MODAL ═══ */}
      {showAuthModal && (
        <LoginModal 
          isAuthenticated={!!session}
          userNickname={profile?.nickname || session?.user?.user_metadata?.full_name || 'Explorador'}
          userEmail={session?.user?.email}
          avatarUrl={profile?.avatar_url || session?.user?.user_metadata?.avatar_url || session?.user?.user_metadata?.picture}
          coins={playerData.coins}
          level={playerData.level}
          bestTime={playerData.lastHighScore}
          onBack={() => setShowAuthModal(false)}
          onLoginSuccess={() => setShowAuthModal(false)}
          onLogout={handleLogout}
        />
      )}

      {/* ═══ NICKNAME SETUP MODAL ═══ */}
      {showNicknameSetup && session?.user && (
        <NicknameModal 
          userId={session.user.id}
          googleAvatarUrl={session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture}
          onSuccess={(nick, avatar) => {
            setProfile((prev: any) => ({ ...prev, nickname: nick, avatar_url: avatar }))
            setShowNicknameSetup(false)
          }}
        />
      )}

      {/* ═══ ONBOARDING MODAL ═══ */}
      {showOnboarding && !session && (
        <AuthOnboarding 
          onComplete={(hideForever) => {
            if (hideForever) localStorage.setItem('sf_onboarding_hidden', 'true')
            setShowOnboarding(false)
          }}
          onLoginSuccess={() => {
            setShowOnboarding(false)
            setShowAuthModal(false)
          }}
        />
      )}

      {/* Overlay de Anúncio Simulado */}
      {isWatchingAd && (
        <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center animate-fade-in">
          <div className="flex flex-col items-center gap-6 max-w-xs w-full px-6">
            <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
               <Icons.Play className="w-8 h-8 text-white/50" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[0.6rem] font-black tracking-[0.3em] text-white/30 uppercase">Anúncio Recompensado</span>
              <h3 className="text-sm font-black text-white uppercase tracking-tight">Carregando Recompensa...</h3>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{ width: `${adProgress}%` }}
              />
            </div>
            <p className="text-[0.55rem] text-white/20 font-bold uppercase text-center leading-relaxed">
              Assista até o fim para dobrar suas moedas conquistadas nesta partida.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
