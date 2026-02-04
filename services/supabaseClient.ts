import { createClient } from '@supabase/supabase-js';

// Credenziali caricate da variabili d'ambiente
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Mancano le variabili d\'ambiente Supabase. ' +
    'Crea un file .env.local con VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);