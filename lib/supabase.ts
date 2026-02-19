
import { createClient } from '@supabase/supabase-js';

// NOTA: Em um ambiente de produção real, estas chaves viriam de process.env
// Para este exemplo, deixamos os placeholders para que você saiba onde inserir.
const supabaseUrl = 'https://seu-projeto.supabase.co';
const supabaseAnonKey = 'sua-chave-anon-aqui';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
