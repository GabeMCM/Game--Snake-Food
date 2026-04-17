import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

/**
 * iOS Safari Viewport Fix
 * 
 * Safari em iOS reporta `dvh`/`vh` baseado no "large viewport" (sem chrome do browser),
 * mas quando address bar + toolbar estão visíveis, a área real é MENOR.
 * Resultado: conteúdo fica escondido embaixo das barras.
 *
 * Solução: usar `visualViewport.height` que retorna a altura REAL visível,
 * e expô-la como CSS custom property `--app-h`.
 */
const updateAppHeight = () => {
  const h = window.visualViewport?.height ?? window.innerHeight
  document.documentElement.style.setProperty('--app-h', `${h}px`)
}

// Atualiza na carga inicial
updateAppHeight()

// Atualiza quando o visual viewport muda (iOS Safari ao mostrar/esconder barras)
window.visualViewport?.addEventListener('resize', updateAppHeight)
// Atualiza na rotação de tela (com pequeno delay para aguardar recalcular)
window.addEventListener('orientationchange', () => setTimeout(updateAppHeight, 150))
// Garantia extra para browsers sem visualViewport
window.addEventListener('resize', updateAppHeight, { passive: true })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)
