import { Icons } from '../components/Icons';

export const SKILL_RECHARGE_TYPES = {
  TIME: 'time',
  BAIT: 'bait',
  FURY: 'fury',
  DEATHS: 'deaths',
} as const;

export type RechargeType = typeof SKILL_RECHARGE_TYPES[keyof typeof SKILL_RECHARGE_TYPES];

export interface SkillStatConfig {
  min: number;
  max: number;
  unit: string;
}

export interface SkillConfig {
  id: string;
  name: string;
  desc: string;
  cost: number;
  color: string;
  bgColor: string;
  rechargeType: RechargeType;
  recharge: SkillStatConfig;
  duration: SkillStatConfig;
  cast: SkillStatConfig;
  extra: SkillStatConfig & { label: string } | null;
  isAutomatic?: boolean;
}

// ── CONFIGURAÇÃO DE EVOLUÇÃO (30 NÍVEIS) ──
export const SKILL_EVOLUTION_CONFIG: Record<string, SkillConfig> = {
  invisibility: {
    id: 'invisibility',
    name: 'INVISIBILIDADE',
    desc: 'Fique indetectável: a cobra ignora sua presença completamente.',
    cost: 15000,
    color: '#A78BFA',
    bgColor: 'rgba(167,139,250,0.10)',
    rechargeType: SKILL_RECHARGE_TYPES.TIME,
    recharge: { min: 30, max: 15, unit: 's' },
    duration: { min: 4, max: 8, unit: 's' },
    cast: { min: 1.2, max: 0.2, unit: 's' },
    extra: null
  },
  frost_aura: {
    id: 'frost_aura',
    name: 'AURA DE GELO',
    desc: 'Desacelera a cobra em 50% quando ela se aproxima do seu campo frio.',
    cost: 1200,
    color: '#00E1FF',
    bgColor: 'rgba(0,225,255,0.08)',
    rechargeType: SKILL_RECHARGE_TYPES.TIME,
    recharge: { min: 25, max: 12, unit: 's' },
    duration: { min: 5, max: 10, unit: 's' },
    cast: { min: 0, max: 0, unit: 's' },
    extra: null
  },
  sacrifice: {
    id: 'sacrifice',
    name: 'SACRIFÍCIO',
    desc: 'Resgate vital: consome 1 vida para converter hits em cura baseada no seu vigor atual.',
    cost: 30000,
    color: '#FF6B7A',
    bgColor: 'rgba(255,60,80,0.08)',
    rechargeType: SKILL_RECHARGE_TYPES.DEATHS,
    recharge: { min: 3, max: 3, unit: ' Resets' },
    duration: { min: 2, max: 4, unit: 's' },
    cast: { min: 0.5, max: 0.2, unit: 's' },
    extra: { min: 20, max: 60, unit: '% HP Atual', label: 'Cura' }
  },
  phantom_block: {
    id: 'phantom_block',
    name: 'MURALHA FANTASMA',
    desc: 'Deixa um rastro sólido impenetrável que bloqueia o avanço da cobra.',
    cost: 1500,
    color: '#FBBF24',
    bgColor: 'rgba(251,191,36,0.08)',
    rechargeType: SKILL_RECHARGE_TYPES.BAIT,
    recharge: { min: 6, max: 3, unit: ' Iscas' },
    duration: { min: 4, max: 8, unit: 's' },
    cast: { min: 0.6, max: 0.2, unit: 's' },
    extra: { min: 2, max: 6, unit: ' Blocos', label: 'Comp.' }
  },
  clones: {
    id: 'clones',
    name: 'CLONES TEMPORÁRIOS',
    desc: 'Cria duplicatas ilusórias que confundem a percepção da cobra.',
    cost: 3200,
    color: '#F472B6',
    bgColor: 'rgba(244,114,182,0.08)',
    rechargeType: SKILL_RECHARGE_TYPES.TIME,
    recharge: { min: 40, max: 20, unit: 's' },
    duration: { min: 4, max: 10, unit: 's' },
    cast: { min: 1.5, max: 0.5, unit: 's' },
    extra: { min: 2, max: 6, unit: ' Clones', label: 'Qtd' }
  },
  gain_zone: {
    id: 'gain_zone',
    name: 'ZONA DE GANHO',
    desc: 'Área de lucro: moedas triplicadas enquanto a cobra head estiver dentro do campo.',
    cost: 4500,
    color: '#34D399',
    bgColor: 'rgba(52,211,153,0.08)',
    rechargeType: SKILL_RECHARGE_TYPES.BAIT,
    recharge: { min: 15, max: 7, unit: ' Iscas' },
    duration: { min: 8, max: 15, unit: 's' },
    cast: { min: 0, max: 0, unit: 's' },
    extra: { min: 3, max: 6, unit: 'm', label: 'Raio' }
  },
  explosive_bait: {
    id: 'explosive_bait',
    name: 'ISCA EXPLOSIVA',
    desc: 'Armadilha: a próxima isca atordoará e causará lentidão persistente na cobra.',
    cost: 10000,
    color: '#EF4444',
    bgColor: 'rgba(239,68,68,0.08)',
    rechargeType: SKILL_RECHARGE_TYPES.TIME,
    recharge: { min: 30, max: 15, unit: 's' },
    duration: { min: 3, max: 7, unit: 's' },
    cast: { min: 1.0, max: 0.3, unit: 's' },
    extra: { min: 20, max: 50, unit: '% Slow', label: 'Efeito' }
  },
  intangibility: {
    id: 'intangibility',
    name: 'INTANGIBILIDADE',
    desc: 'Estado etéreo: você se torna imune ao contato físico da cobra por um bico.',
    cost: 50000,
    color: '#60A5FA',
    bgColor: 'rgba(96,165,250,0.08)',
    rechargeType: SKILL_RECHARGE_TYPES.BAIT,
    recharge: { min: 20, max: 11, unit: ' Iscas' },
    duration: { min: 3, max: 6, unit: 's' },
    cast: { min: 0.4, max: 0.1, unit: 's' },
    extra: null
  }
};

// ── FÓRMULA DE EVOLUÇÃO ──
export const getSkillStatValue = (skillId: string, statKey: 'recharge' | 'duration' | 'cast' | 'extra', level: number) => {
  const config = SKILL_EVOLUTION_CONFIG[skillId];
  if (!config) return 0;

  const stat = config[statKey === 'extra' ? 'extra' : statKey];
  if (!stat) return 0;

  // Progressão Linear de 1 a 30. Acima de 30 é Maestria (ganhos bônus mínimos ou apenas travado no max)
  const progression = Math.min(1, (level - 1) / 29);
  const value = stat.min + (stat.max - stat.min) * progression;

  return statKey === 'cast' ? parseFloat(value.toFixed(2)) : Math.round(value);
};

export interface Skill {
  id: string;
  icon: string;
  name: string;
  cost: number;
  color: string;
  bgColor: string;
  desc: string;
  rechargeType: RechargeType;
  rechargeValue: (lv: number) => number;
  getCd: (lv: number) => string;
  getDur: (lv: number) => string;
  getExtra: (lv: number) => string | null;
  getCast: (lv: number) => string;
  isAutomatic?: boolean;
}

export const SKILLS: Skill[] = Object.values(SKILL_EVOLUTION_CONFIG).map(conf => ({
  id: conf.id,
  name: conf.name,
  icon: conf.id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(''),
  cost: conf.cost,
  color: conf.color,
  bgColor: conf.bgColor,
  desc: conf.desc,
  rechargeType: conf.rechargeType,
  rechargeValue: (lv: number) => getSkillStatValue(conf.id, 'recharge', lv),
  getCd: (lv: number) => `${getSkillStatValue(conf.id, 'recharge', lv)}${conf.recharge.unit}`,
  getDur: (lv: number) => `${getSkillStatValue(conf.id, 'duration', lv)}${conf.duration.unit}`,
  getCast: (lv: number) => `${getSkillStatValue(conf.id, 'cast', lv)}${conf.cast.unit}`,
  getExtra: (lv: number) => {
    if (!conf.extra) return null;
    return `${conf.extra.label}: ${getSkillStatValue(conf.id, 'extra', lv)}${conf.extra.unit}`;
  },
  isAutomatic: conf.isAutomatic
}));
