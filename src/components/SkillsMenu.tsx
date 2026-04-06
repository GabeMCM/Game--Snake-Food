import React from 'react'
import '../App.css'

interface SkillsMenuProps {
  coins: number
  maxHealth: number
  onBack: () => void
  onUpgradeHealth: () => void
  unlockedSkills: { [id: string]: { level: number } }
  equippedSkills: string[]
  onBuySkill: (id: string, cost: number) => void
  onToggleEquip: (id: string) => void
}

export const SkillsMenu: React.FC<SkillsMenuProps> = ({ 
  coins, 
  maxHealth, 
  onBack, 
  onUpgradeHealth,
  unlockedSkills,
  equippedSkills,
  onBuySkill,
  onToggleEquip
}) => {
  const skillsList = [
    { 
      id: 'invisibility', 
      name: 'INVISIBILIDADE', 
      cost: 50, 
      stats: { cd: '15s', dur: '5s', cast: '0.8s' },
      desc: 'A cobra ignora o jogador estrategicamente.' 
    },
    { 
      id: 'frost_aura', 
      name: 'AURA DE GELO', 
      cost: 80, 
      stats: { cd: '20s', dur: '5s', cast: '0.8s' },
      desc: 'Desacelera a cobra drasticamente quando perto.' 
    },
    { 
      id: 'sacrifice', 
      name: 'SACRIFÍCIO (CURA)', 
      cost: 150, 
      stats: { cd: '30s', dur: '5s', cast: '0.8s' },
      desc: 'Se atingido em 5s: encolhe a cobra e cura 30 HP.' 
    }
  ]

  const hpUpgradeCost = 20 + (maxHealth - 100) * 2
  const canEquipMore = equippedSkills.length < 2

  return (
    <div className="menu-container glass neon-border wide">
      <div className="menu-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <h2 className="menu-title-sm">HABILIDADES</h2>
      </div>

      <div className="menu-stats">
        <span className="icon">⬡</span>
        <span className="value">{coins.toFixed(0)}</span>
      </div>

      <div className="skills-scroll">
        <div className="skill-item glass">
          <div className="skill-info">
            <h3>VIDA MÁXIMA</h3>
            <p>Atualmente: <span className="highlight">{maxHealth} HP</span></p>
          </div>
          <button 
            className="buy-btn" 
            onClick={onUpgradeHealth}
            disabled={coins < hpUpgradeCost}
          >
            {hpUpgradeCost} ⬡
          </button>
        </div>

        {skillsList.map(skill => {
          const sData = unlockedSkills[skill.id]
          const isUnlocked = !!sData
          const level = sData?.level || 0
          const cost = skill.cost * (level + 1)
          const isEquipped = equippedSkills.includes(skill.id)
          
          let currentCD = skill.stats.cd
          let currentDur = skill.stats.dur
          
          if (isUnlocked) {
            if (skill.id === 'invisibility') {
               currentCD = `${Math.max(5, 15 - (level - 1))}s`
               currentDur = `${5 + (level - 1)}s`
            } else if (skill.id === 'frost_aura') {
               currentCD = `${Math.max(10, 20 - (level - 1))}s`
               currentDur = `${5 + (level - 1)}s`
            } else if (skill.id === 'sacrifice') {
               currentCD = `${Math.max(15, 30 - (level - 1) * 2)}s`
            }
          }

          return (
            <div key={skill.id} className={`skill-card glass ${isUnlocked ? 'unlocked' : ''} ${isEquipped ? 'equipped' : ''}`}>
              <div className="skill-content">
                <div className="skill-main">
                  <h3>{skill.name} {isUnlocked && `(NV ${level})`}</h3>
                  <p className="skill-desc">{skill.desc}</p>
                  
                  <div className="skill-badges">
                    <span className="badge cd">⏱ {currentCD}</span>
                    <span className="badge dur">✨ {currentDur}</span>
                    <span className="badge cast">⚡ {skill.stats.cast}</span>
                  </div>
                </div>

                <div className="skill-actions">
                  <button 
                    className="buy-btn" 
                    onClick={() => onBuySkill(skill.id, skill.cost)}
                    disabled={coins < cost}
                  >
                    {isUnlocked ? `UP ${cost}` : `COMPRAR ${cost}`}
                  </button>
                  
                  {isUnlocked && (
                    <button 
                      className={`equip-btn ${isEquipped ? 'remove' : 'equip'}`}
                      onClick={() => onToggleEquip(skill.id)}
                      disabled={!isEquipped && !canEquipMore}
                    >
                      {isEquipped ? 'REMOVER' : canEquipMore ? 'EQUIPAR' : 'CHEIO'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="skills-legend glass">
        <div className="legend-item"><span>⏱</span> Cooldown</div>
        <div className="legend-item"><span>✨</span> Duração</div>
        <div className="legend-item"><span>⚡</span> Cast Time</div>
      </div>
    </div>
  )
}
