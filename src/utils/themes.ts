/**
 * themes.ts
 * Central configuration for all game themes.
 * Affects both React UI (via CSS variables) and PixiJS Engine.
 */

export interface ThemeColors {
  // UI Colors (CSS Strings)
  bg: string;
  bgLight: string;
  card: string;
  text: string;
  textDim: string;
  primary: string;
  secondary: string;
  accent: string;
  border: string;
  glass: string;
  buy: string; // Cor para botões de compra/upgrade
  buyText?: string;
  buyMatteText?: string; // Texto para estado offline/desativado
  
  // Engine Colors (Number / Hex)
  engineBg: number;
  engineGrid: number;
  engineGridAlpha: number;
  enginePlayer: number;
  engineSnake: number;
  engineBait: number;
  engineAccent: number;

  // Supplementary UI (Optional overrides)
  buttonText?: string;
  shadow?: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  colors: ThemeColors;
  isRetro: boolean;   // Disables glows, uses pixel fonts/shapes
  isLight: boolean;   // Inverts text contrast shadows
  category: 'simple' | 'special';
  effect?: 'sky' | 'universe' | 'neon';
}

export const THEMES: Record<string, ThemeConfig> = {
  // ── NEON (Padrão) ───────────────────────────────────────────
  neon: {
    id: 'neon',
    name: 'NEON',
    isRetro: false,
    isLight: false,
    category: 'simple',
    effect: 'neon',
    colors: {
      bg: '#080816',
      bgLight: '#0f0f19',
      card: 'rgba(25, 25, 45, 0.7)',
      text: '#f5f5ff',
      textDim: '#8c8caa',
      primary: '#00ff82', // Neon Green
      secondary: '#10b981', // Emerald Green (Para botões e cobra)
      accent: '#ffd700',
      border: 'rgba(255, 255, 255, 0.1)',
      glass: 'rgba(15, 15, 25, 0.7)',
      buy: '#10b981', 
      buyText: '#000000',
      
      engineBg: 0x0a0a12,
      engineGrid: 0xFFFFFF,
      engineGridAlpha: 0.05,
      enginePlayer: 0x00FF82,
      engineSnake: 0x10B981,
      engineBait: 0xF0F0F5,
      engineAccent: 0xFFD700
    }
  },

  // ── LIGHT NEON (Invertido) ──────────────────────────────────
  light_neon: {
    id: 'light_neon',
    name: 'LIGHT NEON',
    isRetro: false,
    isLight: true,
    category: 'simple',
    colors: {
      bg: '#fdfcf8',       // Creme / Off-white
      bgLight: '#f4f2e9',
      card: 'rgba(255, 255, 255, 0.8)',
      text: '#1a1a2e',     // Texto escuro
      textDim: '#5a5a75',
      primary: '#ff6b00',  // Laranja vibrante
      secondary: '#00b464', // Verde sólido
      accent: '#7c3aed',   // Roxo
      border: 'rgba(0, 0, 0, 0.1)',
      glass: 'rgba(255, 255, 255, 0.6)',
      buy: '#ff6b00', // Laranja (Corrigido)
      buyText: '#ffffff',
      
      engineBg: 0xf8fafc,
      engineGrid: 0x00A0FF,
      engineGridAlpha: 0.15,
      enginePlayer: 0xff6b00,
      engineSnake: 0x00b464,
      engineBait: 0x7c3aed,
      engineAccent: 0xFF6B00
    }
  },

  // ── PINK NEON ───────────────────────────────────────────────
  pink_neon: {
    id: 'pink_neon',
    name: 'PINK NEON',
    isRetro: false,
    isLight: false,
    category: 'simple',
    colors: {
      bg: '#0d0d1a',
      bgLight: '#1a0d1a',
      card: 'rgba(30, 15, 30, 0.7)',
      text: '#ffeeff',
      textDim: '#aa88aa',
      primary: '#f472b6',
      secondary: '#a78bfa',
      accent: '#00dbff',
      border: 'rgba(244, 114, 182, 0.2)',
      glass: 'rgba(20, 10, 20, 0.7)',
      buy: '#f472b6', 
      buyText: '#000000',
      
      engineBg: 0x0d0d1a,
      engineGrid: 0xF472B6,
      engineGridAlpha: 0.12,
      enginePlayer: 0xF472B6,
      engineSnake: 0xA78BFA,
      engineBait: 0x00DBFF,
      engineAccent: 0xF472B6
    }
  },

  // ── BLACK NEON ──────────────────────────────────────────────
  black_neon: {
    id: 'black_neon',
    name: 'BLACK NEON',
    isRetro: false,
    isLight: false,
    category: 'simple',
    colors: {
      bg: '#000000',
      bgLight: '#050505',
      card: 'rgba(10, 10, 10, 0.9)',
      text: '#ffffff',
      textDim: '#666666',
      primary: '#00a0ff', // Neon Blue
      secondary: '#00d2ff', // Cyan (Para botões e cobra)
      accent: '#ffffff',
      border: 'rgba(255, 255, 255, 0.15)',
      glass: 'rgba(0, 0, 0, 0.8)',
      buy: '#00a0ff', 
      buyText: '#000000',
      
      engineBg: 0x000000,
      engineGrid: 0x191928,
      engineGridAlpha: 0.3,
      enginePlayer: 0x00A0FF,
      engineSnake: 0x00D2FF,
      engineBait: 0xFFFFFF,
      engineAccent: 0x00FF82
    }
  },

  // ── SKY ─────────────────────────────────────────────────────
  sky: {
    id: 'sky',
    name: 'SKY',
    isRetro: false,
    isLight: true,
    category: 'special',
    effect: 'sky',
    colors: {
      bg: '#e0f2fe',
      bgLight: '#f0f9ff',
      card: 'rgba(255, 255, 255, 0.7)',
      text: '#0c4a6e',
      textDim: '#0369a1',
      primary: '#0ea5e9',
      secondary: '#0284c7', // Darker blue for contrast
      accent: '#f59e0b',
      border: 'rgba(12, 74, 110, 0.15)',
      glass: 'rgba(255, 255, 255, 0.5)',
      buy: '#0ea5e9',
      buyText: '#ffffff',
      buyMatteText: 'rgba(255, 255, 255, 0.9)',
      buttonText: '#ffffff',
      shadow: 'rgba(0, 0, 0, 0.05)',
      
      engineBg: 0x7dd3fc,
      engineGrid: 0xFFFFFF,
      engineGridAlpha: 0.2,
      enginePlayer: 0x0EA5E9,
      engineSnake: 0xFFFFFF,
      engineBait: 0xFDE047,
      engineAccent: 0x0EA5E9
    }
  },

  // ── UNIVERSE ────────────────────────────────────────────────
  universe: {
    id: 'universe',
    name: 'UNIVERSO',
    isRetro: false,
    isLight: false,
    category: 'special',
    effect: 'universe',
    colors: {
      bg: '#080b26',
      bgLight: '#0c0a1f',
      card: 'rgba(15, 10, 40, 0.7)',
      text: '#e0e7ff',
      textDim: '#a5b4fc',
      primary: '#6366f1',
      secondary: '#c084fc',
      accent: '#fbbf24',
      border: 'rgba(100, 100, 255, 0.2)',
      glass: 'rgba(10, 5, 30, 0.8)',
      buy: '#c084fc',
      buyText: '#000000',
      
      engineBg: 0x080b26,
      engineGrid: 0x6366f1,
      engineGridAlpha: 0.1,
      enginePlayer: 0x6366f1,
      engineSnake: 0xC084FC,
      engineBait: 0xFBBF24,
      engineAccent: 0x6366f1
    }
  },

  // ── GAMEBOY (Fidelidade Retro) ──────────────────────────────
  gameboy: {
    id: 'gameboy',
    name: 'GAMEBOY',
    isRetro: true,
    isLight: true,
    category: 'special',
    colors: {
      bg: '#8bac0f',
      bgLight: '#9bbc0f',
      card: 'rgba(155, 188, 15, 0.3)',
      text: '#0f380f',
      textDim: '#0f380f',
      primary: '#306230',
      secondary: '#306230',
      accent: '#1e301e', // Darker accent
      border: 'rgba(15, 56, 15, 0.4)',
      glass: 'rgba(139, 172, 15, 0.2)',
      buy: '#306230',
      buyText: '#ffffff',
      buyMatteText: '#8bac0f',
      buttonText: '#ffffff',
      shadow: 'transparent',
      
      engineBg: 0x8bac0f,
      engineGrid: 0x0f380f,
      engineGridAlpha: 0.08,
      enginePlayer: 0x306230,
      engineSnake: 0x0f380f,
      engineBait: 0x306230,
      engineAccent: 0x0f380f
    }
  },

  // ── NOKIA (Fidelidade Retro) ────────────────────────────────
  nokia: {
    id: 'nokia',
    name: 'NOKIA',
    isRetro: true,
    isLight: true,
    category: 'special',
    colors: {
      bg: '#c7d19e', // Adjusted for slightly better contrast than pure Gameboy green
      bgLight: '#c7d19e',
      card: 'rgba(0, 0, 0, 0.05)',
      text: '#0f380f',
      textDim: '#0f380f',
      primary: '#0f380f',
      secondary: '#0f380f',
      accent: '#0f380f',
      border: 'rgba(15, 56, 15, 0.3)',
      glass: 'transparent',
      buy: '#0f380f',
      buyText: '#c7d19e',
      buyMatteText: '#c7d19e',
      buttonText: '#c7d19e',
      
      engineBg: 0x9bbc0f,
      engineGrid: 0x0f380f,
      engineGridAlpha: 0.1,
      enginePlayer: 0x0f380f,
      engineSnake: 0x5a6a2a,
      engineBait: 0x0f380f,
      engineAccent: 0x0f380f
    }
  }
};

export const applyThemeToCSS = (themeId: string) => {
  const theme = THEMES[themeId] || THEMES.neon;
  const root = document.documentElement;
  
  Object.entries(theme.colors).forEach(([key, value]) => {
    if (typeof value === 'string') {
      root.style.setProperty(`--theme-${key}`, value);
    }
  });

  // Flags auxiliares
  root.style.setProperty('--theme-is-retro', theme.isRetro ? '1' : '0');
  root.style.setProperty('--theme-is-light', theme.isLight ? '1' : '0');
  
  // Custom classes via body attributes
  document.body.setAttribute('data-theme', themeId);
  document.body.classList.toggle('theme-retro', theme.isRetro);
  document.body.classList.toggle('theme-light', theme.isLight);
};
