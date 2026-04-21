import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);

/**
 * Retorna a URL de redirecionamento para o Supabase Auth.
 * Prioriza VITE_AUTH_REDIRECT_URL do .env, senão usa a origin atual.
 */
export const getRedirectUrl = () => {
  const envRedirect = import.meta.env.VITE_AUTH_REDIRECT_URL;
  if (envRedirect) return envRedirect;
  
  // No Supabase, o redirect precisa ser exatamente igual ao cadastrado.
  // Se estivermos em localhost, mas o Supabase espera 127.0.0.1, vai falhar.
  return window.location.origin;
};


if (!supabaseUrl || !supabaseAnonKey) {
  console.log("ℹ️ Supabase: Chaves não configuradas no .env. Modo offline ativado.");
}

export interface Profile {
  id: string;
  nickname: string;
  avatar_url?: string;
  level: number;
  exp: number;
  coins: number;
  best_time: number;
  unlocked_skills: any;
  equipped_skills: string[];
}
