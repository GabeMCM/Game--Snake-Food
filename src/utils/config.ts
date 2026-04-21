/**
 * Este arquivo centraliza todas as configurações externas e links.
 * Futuramente, estes valores podem ser carregados via Supabase 
 * para garantir que não sejam alterados localmente.
 */
export const APP_CONFIG = {
  COMMUNITY: {
    FEEDBACK_FORM: import.meta.env.VITE_FEEDBACK_FORM_URL || 'https://forms.gle/generic-placeholder',
    DONATION_LINK: import.meta.env.VITE_DONATION_LINK_URL || 'https://pix.key/generic-placeholder',
    PIX_KEY: import.meta.env.VITE_PIX_KEY || 'SUA_CHAVE_PIX',
  },
  ADS: {
    SIMULATED_DURATION_MS: 5000,
  }
}
