export interface PlayerData {
  coins: number;
  maxHealth: number;
  unlockedSkills: { [id: string]: { level: number } };
  equippedSkills: string[];
  lastHighScore: number;
}

const STORAGE_KEY = 'snake_food_reforged_save_v2';

const DEFAULT_DATA: PlayerData = {
  coins: 0,
  maxHealth: 100,
  unlockedSkills: {},
  equippedSkills: [],
  lastHighScore: 0
};

export const loadPlayerData = (): PlayerData => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return DEFAULT_DATA;
  try {
    return { ...DEFAULT_DATA, ...JSON.parse(saved) };
  } catch (e) {
    return DEFAULT_DATA;
  }
};

export const savePlayerData = (data: PlayerData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
