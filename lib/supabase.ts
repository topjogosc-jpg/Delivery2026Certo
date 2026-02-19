
import { createClient } from '@supabase/supabase-js';

/**
 * 💡 COMO CONFIGURAR:
 * 1. Acesse https://supabase.com/dashboard
 * 2. Vá em Project Settings > API
 * 3. Copie o "Project URL" e cole no lugar de 'SUA_URL_AQUI'
 * 4. Copie a "API Key (anon/public)" e cole no lugar de 'SUA_CHAVE_ANON_AQUI'
 */

const supabaseUrl = 'SUA_URL_AQUI'; 
const supabaseAnonKey = 'SUA_CHAVE_ANON_AQUI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
