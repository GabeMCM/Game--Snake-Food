export type ColorValue = number | { primary: number; secondary: number };

export interface PlayerData {
  coins: number;
  level: number;
  exp: number;
  unlockedSkills: { [id: string]: { level: number, exp: number } };
  equippedSkills: string[];
  lastHighScore: number;
  // Stats globais agora derivados do Level, mas mantemos os objetos para retrocompatibilidade de estrutura se necessário
  furyStats: { level: number };
  coinStats: { level: number };
  // Cosméticos
  unlockedCosmetics: string[];
  settings: {
    playerColor: ColorValue;
    playerShape: 'rounded' | 'square' | 'circle' | 'triangle' | 'rhombus';
    snakeColor: ColorValue;
    snakeShape: 'rounded' | 'square' | 'circle' | 'triangle' | 'rhombus';
    theme: 'neon' | 'gameboy' | 'nokia' | 'universe' | 'sky';
    disableFlashing: boolean;
  };
}

const STORAGE_KEY = 'snake_food_reforged_save_v2';

const DEFAULT_DATA: PlayerData = {
  coins: 100,
  level: 1,
  exp: 0,
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
    theme: 'neon',
    disableFlashing: true
  }
};

export const loadPlayerData = (): PlayerData => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return DEFAULT_DATA;
  try {
    const data = JSON.parse(saved);
    
    // Inicialização de novos campos se não existirem
    if (data.level === undefined) data.level = 1;
    if (data.exp === undefined) data.exp = 0;
    
    // Remover maxHealth legado para garantir cálculos dinâmicos limpos
    if (data.maxHealth !== undefined) delete data.maxHealth;
    
    // Garantir que skills tenham campo exp
    if (data.unlockedSkills) {
      Object.keys(data.unlockedSkills).forEach(id => {
        if (data.unlockedSkills[id].exp === undefined) {
          data.unlockedSkills[id].exp = 0;
        }
      });
    }

    return { 
      ...DEFAULT_DATA, 
      ...data, 
      settings: { ...DEFAULT_DATA.settings, ...data.settings },
      unlockedSkills: data.unlockedSkills || DEFAULT_DATA.unlockedSkills
    };
  } catch (e) {
    return DEFAULT_DATA;
  }
};

export const savePlayerData = (data: PlayerData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
