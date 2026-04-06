import React from 'react'
import './AdSlot.css'

interface AdSlotProps {
  type: 'banner' | 'rewarded'
  onAction?: () => void
}

export const AdSlot: React.FC<AdSlotProps> = ({ type, onAction }) => {
  if (type === 'rewarded') {
    return (
      <button className="rewarded-ad-btn glass neon-border" onClick={onAction}>
        <div className="btn-content">
          <span className="icon">📺</span>
          <div className="text">
            <span className="label">DOBRAR MOEDAS</span>
            <span className="sub">Ver anúncio</span>
          </div>
        </div>
      </button>
    )
  }

  return (
    <div className="ad-container glass neon-border">
      <span className="ad-label">PATROCINADO</span>
      <div className="ad-content">
        <div className="ad-promo">
          <div className="promo-icon">🚀</div>
          <div className="promo-text">
            <h4>PWA STORE</h4>
            <p>Descubra novos jogos instantâneos!</p>
          </div>
        </div>
        <button className="ad-action-btn">VISITAR</button>
      </div>
    </div>
  )
}
