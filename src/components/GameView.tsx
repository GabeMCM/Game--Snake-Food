import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { Application } from 'pixi.js'
import { GameEngine } from '../game/GameEngine'

interface GameViewProps {
  onCoinCollect: (amt: number) => void
  onHit: (dmg: number) => void
  onHeal: (amt: number) => void
  onTimeUpdate: (time: number) => void
  health: number
  maxHealth: number
}

export interface GameViewRef {
  activateInvisibility: (duration: number) => void
  toggleFrostAura: (active: boolean) => void
  activateSacrifice: (duration: number) => void
  stop: () => void
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
    activateSacrifice: (duration: number) => {
      engineRef.current?.activateSacrifice(duration)
    },
    stop: () => {
      engineRef.current?.stop()
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
        
        app.canvas.style.width = '100%'
        app.canvas.style.height = '100%'
        app.canvas.style.objectFit = 'contain'
        app.canvas.style.borderRadius = '16px'
        
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

  const handleInteraction = (e: React.PointerEvent) => {
    if (e.cancelable) e.preventDefault()
    if (engineRef.current) {
      console.log("👆 Interação Imediata (PointerDown)")
      engineRef.current.triggerSwap()
    }
  }

  return (
    <div 
      ref={containerRef} 
      onPointerDown={handleInteraction}
      className="game-canvas-container"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        cursor: 'pointer',
        touchAction: 'none'
      }}
    />
  )
})
