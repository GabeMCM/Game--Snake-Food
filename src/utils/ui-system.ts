/**
 * SF Design System 1.0 (Rigoroso)
 * 
 * Centraliza todas as medidas, escalas e padrões visuais do jogo 
 * para garantir consistência entre menus, modais e listas.
 */

export const SF_UI = {
  // 1. Tokens de Arredondamento (Elevado para Premium)
  rounding: {
    modal: "rounded-3xl",    // Modais e Hubs (24px)
    card: "rounded-2xl",     // Cards de conteúdo (16px)
    button: "rounded-xl",    // Botões de ação (12px)
    avatar: "rounded-xl",    // Fotos de perfil
    inner: "rounded-lg",     // Inputs, mini chips
    full: "rounded-full"     // Circulares
  },

  // 2. Configurações de Layout (Sincronizado)
  layout: {
    modal: "w-full max-w-lg p-8 flex flex-col gap-8 glass border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]",
    card: "glass p-4 border border-white/5 flex items-center gap-4 transition-all hover:bg-white/5 hover:border-white/10",
    grid2: "grid grid-cols-2 gap-4 w-full",
    section: "flex flex-col gap-3 w-full"
  },

  // 3. Efeitos de Interface (Novo)
  effects: {
    glowPrimary: "shadow-[0_0_20px_rgba(0,163,255,0.15)] border-neon-blue/30",
    glowSecondary: "shadow-[0_0_20px_rgba(0,255,130,0.15)] border-neon-green/30",
    glowAccent: "shadow-[0_0_20px_rgba(251,191,36,0.15)] border-neon-gold/30",
    glowDanger: "shadow-[0_0_30px_rgba(255,60,80,0.2)] border-red/30",
    glass: "glass backdrop-blur-3xl",
    overlay: "fixed inset-0 z-[400] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-6"
  },

  // 4. Hierarquia Tipográfica
  typography: {
    h1: "text-xl font-black uppercase tracking-tighter text-[var(--theme-text)]",
    h2: "text-2xl font-black uppercase tracking-tight text-[var(--theme-text)]",
    label: "text-[0.6rem] font-black tracking-[0.3em] uppercase opacity-60 text-[var(--theme-text)]",
    sectionTitle: "text-[0.65rem] font-black tracking-widest uppercase opacity-80 px-2",
    body: "text-sm font-black uppercase tracking-tight text-[var(--theme-text)]",
    caption: "text-[0.65rem] font-bold text-white/40 uppercase leading-snug"
  },

  // 5. Botões
  button: {
    primary: "w-full py-5 bg-[var(--theme-primary)] text-[#050508] font-black text-xs tracking-[0.3em] shadow-lg shadow-[var(--theme-primary)]/20 active:scale-95 transition-all uppercase rounded-xl",
    secondary: "glass p-4 flex items-center gap-4 border border-white/5 hover:bg-white/5 active:scale-[0.98] transition-all rounded-xl",
    accent: "w-full py-4 bg-[var(--theme-accent)] text-black font-black text-xs tracking-[0.2em] shadow-lg active:scale-95 transition-all uppercase rounded-xl",
    back: "btn-outline !p-2.5 h-11 w-11 flex items-center justify-center transition-transform active:scale-90 hover:bg-white/5 border border-white/10 rounded-xl",
    danger: "w-full py-4 bg-red/10 border border-red/20 text-red font-black text-[0.65rem] tracking-[0.2em] hover:bg-red/20 transition-all active:scale-95 rounded-xl",
    ghost: "text-white/20 font-black text-[0.6rem] tracking-[0.3em] uppercase hover:text-white/40 transition-all"
  },

  // 6. Perfil
  profile: {
    avatarContainer: "relative w-28 h-28 bg-gradient-to-br from-white/10 to-transparent border border-white/10 p-2 flex items-center justify-center",
    avatarBadge: "absolute -bottom-2 -right-2 bg-[var(--theme-primary)] text-white text-[0.8rem] font-black w-10 h-10 border-[6px] border-[var(--theme-bg)] flex items-center justify-center shadow-lg"
  },

  // 7. Avatares
  avatar: {
    list: "flex flex-wrap items-center justify-center gap-4",
    item: "relative w-16 h-16 border-2 transition-all active:scale-90 rounded-xl"
  }
};

