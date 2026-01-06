import { createClient } from '@supabase/supabase-js';

// Configuration for CefaLog Supabase Project
// Credenziali inserite per il progetto
const SUPABASE_URL = 'https://mgtgicwswjcykhjvnsse.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pf4QpGjbaZR31Lb9xzE9Qw_w_tMIES9';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);