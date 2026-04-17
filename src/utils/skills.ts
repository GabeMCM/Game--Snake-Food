export interface Skill {
  id: string;
  icon: string;
  name: string;
  cost: number;
  color: string;
  bgColor: string;
  desc: string;
  getCd: (lv: number) => string;
  getDur: (lv: number) => string;
  getExtra: (lv: number) => string | null;
  getCast: (lv: number) => string;
  cast?: string; // Legacy
}

export const SKILLS: Skill[] = [
  {
    id: 'invisibility',
    icon: 'Invisibility',
    name: 'INVISIBILIDADE',
    cost: 80,
    color: '#A78BFA',
    bgColor: 'rgba(167,139,250,0.10)',
    desc: 'A cobra ignora você estrategicamente por alguns segundos.',
    getCd: (lv: number) => `${Math.max(5, 15 - (lv - 1))}s`,
    getDur: (lv: number) => `${5 + (lv - 1)}s`,
    getExtra: (_lv: number): string | null => null,
    getCast: (lv: number) => `${Math.max(0, 0.8 - (lv - 1) * 0.1).toFixed(1)}s`,
  },
  {
    id: 'frost_aura',
    icon: 'FrostAura',
    name: 'AURA DE GELO',
    cost: 120,
    color: '#00E1FF',
    bgColor: 'rgba(0,225,255,0.08)',
    desc: 'Desacelera a cobra em 50% quando ela se aproxima.',
    getCd: (lv: number) => `${Math.max(10, 20 - (lv - 1))}s`,
    getDur: (lv: number) => `${5 + (lv - 1)}s`,
    getExtra: (_lv: number): string | null => null,
    getCast: (lv: number) => `${Math.max(0, 0.8 - (lv - 1) * 0.1).toFixed(1)}s`,
  },
  {
    id: 'sacrifice',
    icon: 'Sacrifice',
    name: 'SACRIFÍCIO',
    cost: 250,
    color: '#FF6B7A',
    bgColor: 'rgba(255,60,80,0.08)',
    desc: 'Próximo toque da cobra: ela encolhe e você recupera HP.',
    getCd: (lv: number) => `${Math.max(15, 30 - (lv - 1) * 2)}s`,
    getDur: (_lv: number) => '5s',
    getExtra: (lv: number): string | null => `+${30 + (lv - 1) * 5} HP`,
    getCast: (lv: number) => `${Math.max(0, 0.8 - (lv - 1) * 0.1).toFixed(1)}s`,
  },
  {
    id: 'phantom_block',
    icon: 'PhantomBlock',
    name: 'BLOQUEIO',
    cost: 90,
    color: '#94A3B8',
    bgColor: 'rgba(148,163,184,0.10)',
    desc: 'Cria obstáculos aleatórios que bloqueiam apenas a cobra.',
    getCd: (lv: number) => `${Math.max(10, 25 - (lv - 1) * 2)}s`,
    getDur: (lv: number) => `${8 + (lv - 1)}s`,
    getExtra: (lv: number): string | null => `${3 + Math.floor(lv / 2)} blocos`,
    getCast: (lv: number) => `${Math.max(0, 0.8 - (lv - 1) * 0.1).toFixed(1)}s`,
  },
  {
    id: 'clones',
    icon: 'Clones',
    name: 'CLONES',
    cost: 180,
    color: '#F472B6',
    bgColor: 'rgba(244,114,182,0.10)',
    desc: 'Cria iscas falsas temporárias para despistar a cobra.',
    getCd: (lv: number) => `${Math.max(15, 30 - (lv - 1) * 2)}s`,
    getDur: (lv: number) => `${10 + (lv - 1)}s`,
    getExtra: (lv: number): string | null => `${1 + Math.floor(lv / 2)} clones`,
    getCast: (lv: number) => `${Math.max(0, 0.8 - (lv - 1) * 0.1).toFixed(1)}s`,
  },
  {
    id: 'gain_zone',
    icon: 'GainZone',
    name: 'ZONA DE GANHO',
    cost: 200,
    color: '#FBBF24',
    bgColor: 'rgba(251,191,36,0.10)',
    desc: 'Triplica moedas na área, mas acelera a cobra exponencialmente.',
    getCd: (lv: number) => `${Math.max(20, 40 - (lv - 1) * 3)}s`,
    getDur: (lv: number) => `${12 + (lv - 1) * 2}s`,
    getExtra: (lv: number): string | null => `Raio: ${5 + lv}`,
    getCast: (lv: number) => `${Math.max(0, 0.8 - (lv - 1) * 0.1).toFixed(1)}s`,
  },
  {
    id: 'explosive_bait',
    icon: 'ExplosiveBait',
    name: 'ISCA EXPLOSIVA',
    cost: 70,
    color: '#EF4444',
    bgColor: 'rgba(239,68,68,0.10)',
    desc: 'Stuna a cobra ao comer a isca. Upgrade reduz velocidade pós-stun.',
    getCd: (lv: number) => `${Math.max(15, 35 - (lv - 1) * 2)}s`,
    getDur: (_lv: number) => '15s',
    getExtra: (lv: number): string | null => lv > 1 ? `Slow: ${Math.min(50, (lv - 1) * 10)}%` : 'Só Stun',
    getCast: (lv: number) => `${Math.max(0, 0.8 - (lv - 1) * 0.1).toFixed(1)}s`,
  },
  {
    id: 'intangibility',
    icon: 'Intangibility',
    name: 'INTANGIBILIDADE',
    cost: 300,
    color: '#00A0FF',
    bgColor: 'rgba(0,160,255,0.10)',
    desc: 'Permite que a cobra o atravesse sem causar dano.',
    getCd: (lv: number) => `${Math.max(15, 35 - (lv - 1) * 2)}s`,
    getDur: (lv: number) => `${4 + (lv - 1)}s`,
    getExtra: (_lv: number): string | null => 'Invencível',
    getCast: (lv: number) => `${Math.max(0, 0.8 - (lv - 1) * 0.1).toFixed(1)}s`,
  },
]
