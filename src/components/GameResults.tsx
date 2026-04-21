import React from 'react'
import { Icons } from './Icons'
import { getRequiredExpForNextLevel, getSkillRequiredExpForNextLevel } from '../utils/progression'
import { SKILLS } from '../utils/skills'
import { SF_UI } from '../utils/ui-system'

interface GameResultsProps {
  stats: {
    time: number
    coins: number
    exp: number
    isNewBest: boolean
  }
  playerData: any
  onRestart: () => void
  onDoubleCoins: () => void
  adUsed: boolean
}

export const GameResults: React.FC<GameResultsProps> = ({
  stats, playerData, onRestart, onDoubleCoins, adUsed
}) => {
  const currentReq = getRequiredExpForNextLevel(playerData.level)
  const expProgress = (playerData.exp / currentReq) * 100

  return (
    <div className={`${SF_UI.effects.overlay}`}>
      <div className={`${SF_UI.layout.modal} scale-in`}>

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-neon-glow bg-gradient-to-br from-[var(--theme-primary)] via-[var(--theme-secondary)] to-[var(--theme-accent)] bg-clip-text text-transparent text-4xl font-black tracking-[0.2em] mb-1">
            FIM DA RODADA
          </h1>
          <div className="flex flex-col items-center gap-1">
            <span className={`${SF_UI.typography.label} opacity-40`}>RESULTADO DO RITUAL</span>
            {stats.isNewBest && (
              <span className="text-neon-green text-[0.6rem] font-black tracking-[0.4em] uppercase animate-pulse">
                Novo Recorde Mundial!
              </span>
            )}
          </div>
        </div>

        {/* MAIN STATS GRID */}
        <div className={`${SF_UI.layout.grid2}`}>
          <div className={`${SF_UI.layout.card} flex-col items-center`}>
            <span className={`${SF_UI.typography.caption}`}>Sobreviveu</span>
            <span className="text-[var(--theme-text)] font-black text-2xl">{stats.time.toFixed(1)}s</span>
          </div>
          <div className={`${SF_UI.layout.card} flex-col items-center ${SF_UI.effects.glowAccent}`}>
            <span className={`${SF_UI.typography.caption} text-[var(--theme-accent)]`}>Capital</span>
            <span className="text-[var(--theme-accent)] font-black text-2xl flex items-center gap-2">
              <Icons.Coin className="w-5 h-5" /> {stats.coins}
            </span>
          </div>
        </div>

        {/* PROGRESSION BLOCK */}
        <div className={`${SF_UI.layout.section}`}>
          <h3 className={`${SF_UI.typography.sectionTitle} text-[var(--theme-primary)]`}>PROGRESSÃO DE CONTA</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-[0.6rem] font-black tracking-widest uppercase text-white/50">
              <span>ESTÁGIO {playerData.level}</span>
              <span className="text-neon-blue">+{stats.exp} XP</span>
            </div>
            <div className={`h-2.5 w-full bg-white/5 ${SF_UI.rounding.full} overflow-hidden border border-white/5`}>
              <div
                className="h-full bg-neon-blue shadow-[0_0_15px_rgba(0,163,255,0.4)] transition-all duration-1000 ease-out"
                style={{ width: `${expProgress}%` }}
              />
            </div>
          </div>

          {/* SKILLS EXP (EQUIPPED) */}
          {playerData.equippedSkills.length > 0 && (
            <div className="pt-4 border-t border-white/5 space-y-4">
              <span className={`${SF_UI.typography.caption} text-center block opacity-20`}>Sincronia de Habilidades</span>
              <div className="space-y-3">
                {playerData.equippedSkills.map((id: string) => {
                  const sData = playerData.unlockedSkills[id]
                  const sDef = SKILLS.find(s => s.id === id)
                  if (!sData || !sDef) return null

                  const sReq = getSkillRequiredExpForNextLevel(sData.level)
                  const sProg = (sData.exp / sReq) * 100

                  return (
                    <div key={id} className="flex items-center gap-4">
                      <div className={`w-10 h-10 ${SF_UI.rounding.button} bg-white/5 flex items-center justify-center shrink-0 border border-white/10`}
                        style={{ color: sDef.color }}>
                        {React.createElement(Icons[sDef.icon as keyof typeof Icons], { className: "w-6 h-6" })}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between text-[0.6rem] font-black uppercase tracking-tight text-white/60">
                          <span>{sDef.name}</span>
                          <span className="opacity-40">GRAU {sData.level}</span>
                        </div>
                        <div className={`h-1.5 w-full bg-white/5 ${SF_UI.rounding.full} overflow-hidden`}>
                          <div
                            className="h-full transition-all duration-1000"
                            style={{ width: `${sProg}%`, backgroundColor: sDef.color }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="w-full flex flex-col gap-4">
          {!adUsed && stats.coins > 0 && (
            <button
              onClick={onDoubleCoins}
              className={`${SF_UI.button.accent} flex items-center justify-center gap-3`}
            >
              <Icons.Play className="w-5 h-5" /> DOBRAR CAPITAL (+{stats.coins})
            </button>
          )}

          <button
            onClick={onRestart}
            className={`${SF_UI.button.primary}`}
          >
            RETORNAR AO HUB
          </button>
        </div>
      </div>
    </div>
  )
}
