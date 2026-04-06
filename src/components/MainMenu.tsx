import React from 'react'
import '../App.css'
import { AdSlot } from './AdSlot'

interface MainMenuProps {
  coins: number
  onStart: () => void
  onOpenSkills: () => void
}

export const MainMenu: React.FC<MainMenuProps> = ({ coins, onStart, onOpenSkills }) => {
  return (
    <div className="menu-container glass neon-border">
      <h1 className="menu-title">SNAKE FOOD</h1>
      <div className="menu-stats">
        <span className="icon">⬢</span>
        <span className="value">{coins}</span>
      </div>
      
      <div className="menu-buttons">
        <button className="menu-btn primary" onClick={onStart}>
          INICIAR
        </button>
        <button className="menu-btn secondary" onClick={onOpenSkills}>
          LOJA & SKILLS
        </button>
      </div>

      {/* ANÚNCIO / PWA STORE PROMO */}
      <AdSlot type="banner" />
      
      <div className="menu-footer">
        <p>USE O SWAP PARA SOBREVIVER</p>
      </div>
    </div>
  )
}
