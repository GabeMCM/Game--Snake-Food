import { AdSlot } from './AdSlot'
import { Icons } from './Icons'

interface MainMenuProps {
  coins: number
  bestTime: number
  onStart: () => void
  onOpenSkills: () => void
  onOpenAppearance: () => void
}

export const MainMenu: React.FC<MainMenuProps> = ({ coins, bestTime, onStart, onOpenSkills, onOpenAppearance }) => {
  return (
    <div className="animate-fade-in w-full h-full flex flex-col items-center justify-center p-6 sm:p-10 overflow-y-auto overflow-x-hidden">
      
      <div className="main-menu-grid w-full flex flex-col items-center gap-8">
        
        {/* Left Section: Identity & Stats */}
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Brand identity */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <span className="text-[0.6rem] font-black tracking-[0.4em] text-[var(--theme-textDim)] uppercase opacity-70">
              VOCÊ É A COMIDA
            </span>
            <h1 className="text-neon-gradient text-5xl sm:text-6xl font-black tracking-[0.15em] leading-tight text-center m-0">
              SNAKE FOOD
            </h1>
            <span className="text-[0.65rem] font-bold tracking-[0.6em] text-[var(--theme-primary)] opacity-60">
              R E F O R G E D
            </span>
          </div>

          {/* Stats row: moedas + recorde */}
          <div className="glass rounded-3xl px-8 py-4 flex items-center gap-8 shrink-0">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[0.55rem] font-black tracking-widest text-[var(--theme-textDim)] uppercase">MOEDAS</span>
              <div className="flex items-center gap-2">
                <Icons.Coin className="w-5 h-5 text-[var(--theme-accent)]" />
                <span className="text-[var(--theme-accent)] text-2xl font-black">{coins}</span>
              </div>
            </div>
            {bestTime > 0 && (
              <>
                <div className="w-px h-10 bg-[var(--theme-border)]" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[0.55rem] font-black tracking-widest text-[var(--theme-textDim)] uppercase">RECORDE</span>
                  <div className="flex items-center gap-2 text-[var(--theme-text)]">
                    <Icons.Trophy className="w-5 h-5 opacity-80" />
                    <span className="text-2xl font-black">{bestTime.toFixed(1)}s</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Section: Buttons & CTA */}
        <div className="flex flex-col gap-4 w-full max-w-sm shrink-0">
          <button
            className="glow-green glow-green-hover w-full py-5 rounded-3xl bg-[var(--theme-secondary)] text-[var(--theme-bg)] border-none
                       font-sans text-lg font-black tracking-[4px] cursor-pointer
                       flex items-center justify-center gap-3 transition-all duration-300
                       hover:-translate-y-1 active:scale-[0.96]"
            onClick={onStart}
          >
            <Icons.Play className="w-6 h-6" />
            JOGAR AGORA
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              className="glow-blue-hover py-4 rounded-2xl bg-transparent text-[var(--theme-text)]
                         border border-[var(--theme-border)] font-sans text-[0.65rem] font-black tracking-[2px]
                         cursor-pointer transition-all duration-200 backdrop-blur-sm
                         flex flex-col items-center gap-2 justify-center
                         active:scale-[0.96]"
              onClick={onOpenSkills}
            >
              <Icons.Upgrades className="w-5 h-5 opacity-70" />
              UPGRADES
            </button>
            <button
              className="glow-blue-hover py-4 rounded-2xl bg-transparent text-[var(--theme-text)]
                         border border-[var(--theme-border)] font-sans text-[0.65rem] font-black tracking-[2px]
                         cursor-pointer transition-all duration-200 backdrop-blur-sm
                         flex flex-col items-center gap-2 justify-center
                         active:scale-[0.96]"
              onClick={onOpenAppearance}
            >
              <Icons.Appearance className="w-5 h-5 opacity-70" />
              APARÊNCIA
            </button>
          </div>

          <p className="text-[0.6rem] font-black text-[var(--theme-textDim)] text-center m-0 mt-4 tracking-widest opacity-60 uppercase">
            Toque ↔ Swap
          </p>

          <div className="flex justify-center mt-2">
            <AdSlot type="banner" />
          </div>
        </div>

      </div>
    </div>
  )
}
