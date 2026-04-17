export type ColorValue = number | { primary: number; secondary: number };

export interface PlayerData {
  coins: number;
  maxHealth: number;
  unlockedSkills: { [id: string]: { level: number } };
  equippedSkills: string[];
  lastHighScore: number;
  furyStats: {
    level: number;
  };
  coinStats: {
    level: number;
  };
  // Cosméticos
  unlockedCosmetics: string[];
  settings: {
    playerColor: ColorValue;
    playerShape: 'rounded' | 'square' | 'circle' | 'triangle' | 'rhombus';
    snakeColor: ColorValue;
    snakeShape: 'rounded' | 'square' | 'circle' | 'triangle' | 'rhombus';
    theme: 'neon' | 'gameboy' | 'nokia' | 'universe' | 'sky';
  };
}

const STORAGE_KEY = 'snake_food_reforged_save_v2';

const DEFAULT_DATA: PlayerData = {
  coins: 100,
  maxHealth: 100,
  unlockedSkills: {},
  equippedSkills: [],
  lastHighScore: 0,
  furyStats: {
    level: 1
  },
  coinStats: {
    level: 1
  },
  unlockedCosmetics: ['color_electric', 'shape_rounded', 'theme_neon'],
  settings: {
    playerColor: { primary: 0x00A0FF, secondary: 0x00A0FF },
    playerShape: 'rounded',
    snakeColor: { primary: 0x00FF82, secondary: 0x00FF82 },
    snakeShape: 'rounded',
    theme: 'neon'
  }
};

export const loadPlayerData = (): PlayerData => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return DEFAULT_DATA;
  try {
    const data = JSON.parse(saved);
    
    // Migração: Converter cores simples para objetos dual-color
    if (typeof data.settings?.playerColor === 'number') {
      data.settings.playerColor = { primary: data.settings.playerColor, secondary: data.settings.playerColor };
    }
    if (typeof data.settings?.snakeColor === 'number') {
      data.settings.snakeColor = { primary: data.settings.snakeColor, secondary: data.settings.snakeColor };
    }

    // Migração: Converter níveis de fúria separados para o único unificado
    if (data.furyStats && (data.furyStats.durationLevel || data.furyStats.rewardLevel)) {
      data.furyStats.level = Math.max(data.furyStats.level || 1, data.furyStats.durationLevel || 1, data.furyStats.rewardLevel || 1);
    }

    // Migração: Inicializar nível de moedas se não existir
    if (!data.coinStats) {
      data.coinStats = { level: 1 };
    }

    return { ...DEFAULT_DATA, ...data, settings: { ...DEFAULT_DATA.settings, ...data.settings }, furyStats: { ...DEFAULT_DATA.furyStats, ...data.furyStats }, coinStats: { ...DEFAULT_DATA.coinStats, ...data.coinStats } };
  } catch (e) {
    return DEFAULT_DATA;
  }
};

export const savePlayerData = (data: PlayerData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
