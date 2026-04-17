import React from 'react'

interface AdSlotProps {
  type: 'banner' | 'rewarded'
  onAction?: () => void
}

export const AdSlot: React.FC<AdSlotProps> = ({ type, onAction }) => {
  if (type === 'rewarded') {
    return (
      <button
        className="glass neon-border flex items-center justify-center gap-3 w-full max-w-xs mx-auto 
                   rounded-xl px-6 py-3 cursor-pointer transition-all duration-300
                   hover:bg-white/10 hover:border-neon-blue hover:-translate-y-0.5
                   active:scale-95"
        onClick={onAction}
      >
        <span className="text-3xl">📺</span>
        <div className="flex flex-col items-start">
          <span className="font-extrabold text-sm tracking-wide text-neon-blue">DOBRAR MOEDAS</span>
          <span className="text-xs opacity-60">Ver anúncio</span>
        </div>
      </button>
    )
  }

  return (
    <div className="glass neon-border flex flex-col rounded-xl p-3 mx-auto w-[90%] max-w-sm">
      <span className="text-[0.6rem] text-white/40 tracking-widest mb-2">PATROCINADO</span>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="text-2xl bg-white/10 p-2 rounded-lg">🚀</div>
          <div>
            <h4 className="text-sm font-bold text-white m-0">PWA STORE</h4>
            <p className="text-xs text-white/60 m-0">Descubra novos jogos instantâneos!</p>
          </div>
        </div>
        <button className="bg-gradient-to-br from-cyan-400 to-blue-400 border-none rounded-lg text-white px-4 py-2 text-xs font-bold cursor-pointer hover:scale-105 transition-transform">
          VISITAR
        </button>
      </div>
    </div>
  )
}
