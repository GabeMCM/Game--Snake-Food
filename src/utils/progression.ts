/**
 * Fórmulas de Progressão (EXP e Níveis)
 * Baseado no feedback do usuário e balanceamento refinado.
 */

// --- CONFIGURAÇÃO DE CURVAS ---
export const PLAYER_EXP_FACTOR = 100;
export const PLAYER_EXP_EXPONENT = 1.3;

export const SKILL_EXP_FACTOR = 150;
export const SKILL_EXP_EXPONENT = 1.4;

/**
 * Calcula a EXP necessária para atingir o próximo nível
 * @param level Nível atual (ex: para ir do 5 pro 6, level=5)
 */
export const getRequiredExpForNextLevel = (level: number): number => {
  return Math.floor(PLAYER_EXP_FACTOR * Math.pow(level, PLAYER_EXP_EXPONENT));
};

/**
 * Calcula a EXP necessária para o próximo nível de uma habilidade
 */
export const getSkillRequiredExpForNextLevel = (level: number): number => {
  return Math.floor(SKILL_EXP_FACTOR * Math.pow(level, SKILL_EXP_EXPONENT));
};

/**
 * Calcula a EXP ganha em uma sessão baseada no tempo
 */
export const calculateSessionExp = (timeInSeconds: number, isFuryActiveDuringMatch: boolean = false): number => {
  // Escala não linear: Time * (1 + Time/60)
  const baseExp = timeInSeconds * (1 + timeInSeconds / 60);
  const furyMultiplier = isFuryActiveDuringMatch ? 1.5 : 1.0;
  return Math.floor(baseExp * furyMultiplier);
};

// --- BÔNUS POR NÍVEL ---

export const getHealthBonusForLevel = (level: number): number => {
  return (level - 1) * 2; // +2 HP por nível
};

export const getCoinMultiplierForLevel = (level: number): number => {
  return 1.0 + (level - 1) * 0.03; // +3% por nível
};

export const getFuryEfficiencyForLevel = (level: number): number => {
  return 1.0 + (level - 1) * 0.015; // +1.5% por nível
};

// --- LOGICA DE SKILLS ---

export const SKILL_PASSIVE_EXP_RATIO = 0.5; // Ganha 50% da EXP do player passivamente
export const SKILL_USE_EXP_BONUS = 15; // +15 EXP por cada uso ativo
