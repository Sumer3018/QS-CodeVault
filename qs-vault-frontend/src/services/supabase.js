// src/services/supabase.js
import { createClient } from '@supabase/supabase-js';

// Replace these with your project details from the Supabase Dashboard
const supabaseUrl = 'https://vypkflbxvzwsfedbtwxi.supabase.co'; 
const supabaseKey = 'sb_publishable_90nvsF0FuH-wbHdwTgivBA_s0wiobBx';

export const supabase = createClient(supabaseUrl, supabaseKey);