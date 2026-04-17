import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { Application } from 'pixi.js'
import { GameEngine } from '../game/GameEngine'

interface GameViewProps {
  onCoinCollect: (amt: number) => void
  onHit: (dmg: number) => void
  onHeal: (amt: number) => void
  onTimeUpdate: (time: number) => void
  onFuryUpdate: (progress: number) => void
  onFuryActiveChange: (active: boolean, mode: string) => void
  health: number
  maxHealth: number
  appearance: any
  furyStats: { level: number }
  coinStats: { level: number }
}

export interface GameViewRef {
  activateInvisibility: (duration: number) => void
  toggleFrostAura: (active: boolean) => void
  activateSacrifice: (duration: number, healAmt?: number) => void
  activatePhantomBlock: (duration: number, count: number) => void
  activateClones: (duration: number, count: number) => void
  activateGainZone: (duration: number, radius: number) => void
  activateExplosiveBait: (duration: number, slowAmt: number) => void
  activateIntangibility: (duration: number) => void
  start: () => void
  stop: () => void
  triggerSwap: () => void
}

export const GameView = forwardRef<GameViewRef, GameViewProps>((props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<GameEngine | null>(null)
  const appRef = useRef<Application | null>(null)
  const propsRef = useRef(props)

  // Sincronizar propsRef para que o engine sempre veja os valores mais recentes
  useEffect(() => {
    propsRef.current = props
    if (engineRef.current) {
      engineRef.current.props = props
    }
  }, [props])

  useImperativeHandle(ref, () => ({
    activateInvisibility: (duration: number) => {
      engineRef.current?.activateInvisibility(duration)
    },
    toggleFrostAura: (active: boolean) => {
      engineRef.current?.toggleFrostAura(active)
    },
    activateSacrifice: (duration: number, healAmt?: number) => {
      engineRef.current?.activateSacrifice(duration, healAmt)
    },
    activatePhantomBlock: (duration: number, count: number) => {
        engineRef.current?.activatePhantomBlock(duration, count)
    },
    activateClones: (duration: number, count: number) => {
        engineRef.current?.activateClones(duration, count)
    },
    activateGainZone: (duration: number, radius: number) => {
        engineRef.current?.activateGainZone(duration, radius)
    },
    activateExplosiveBait: (duration: number, slowAmt: number) => {
        engineRef.current?.activateExplosiveBait(duration, slowAmt)
    },
    activateIntangibility: (duration: number) => {
        engineRef.current?.activateIntangibility(duration)
    },
    start: () => {
      engineRef.current?.start()
    },
    stop: () => {
      engineRef.current?.stop()
    },
    triggerSwap: () => {
      engineRef.current?.triggerSwap()
    }
  }))

  useEffect(() => {
    let app: Application | null = null
    let engine: GameEngine | null = null
    let isDestroyed = false

    const init = async () => {
      console.log("🛠️ Inicializando Pixi...")
      app = new Application()
      appRef.current = app

      try {
        await app.init({
          width: 640,
          height: 640,
          backgroundColor: 0x080816,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        })

        if (isDestroyed || !containerRef.current) {
          console.log("⚠️ Inicialização concluída após unmount ou sem container")
          app.destroy(true, { children: true, texture: true })
          return
        }
        
        console.log("✅ Anexando Canvas...")
        containerRef.current.appendChild(app.canvas)
        
        // Passamos uma proxy ou uma função que resolve as props atuais para evitar closures obsoletas
        engine = new GameEngine(app, propsRef.current)
        
        // Pequeno ajuste: o motor precisa de uma forma de acessar as props atualizadas
        // Vamos injetar um getter ou simplesmente atualizar o objeto props do engine
        engineRef.current = engine
        engine.start()
      } catch (err) {
        console.error("❌ Erro no Init:", err)
      }
    }

    init()

    return () => {
      isDestroyed = true
      console.log("🗑️ Limpando GameView")
      if (engineRef.current) {
        engineRef.current.destroy()
        engineRef.current = null
      }
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true })
        appRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateProps(props)
    }
  }, [props])

  return (
    <div 
      ref={containerRef} 
      className="game-canvas-container w-full h-full flex items-center justify-center overflow-hidden cursor-pointer touch-none"
    />
  )
})
