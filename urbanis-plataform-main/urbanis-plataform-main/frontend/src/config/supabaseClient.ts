import { createClient } from '@supabase/supabase-js';

// Read variables from Vite environment (using fallback values to avoid runtime app crash)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Safe check to determine if the user has configured their credentials
export const isSupabaseConfigured = 
  !!import.meta.env.VITE_SUPABASE_URL && 
  !!import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder-project.supabase.co';

if (!isSupabaseConfigured) {
  console.warn(
    "Urbanis: Supabase credentials are missing or placeholder. Running in Offline Local Storage mode. " +
    "To enable cloud PostgreSQL and secure auth, create a '.env.local' file in the frontend root directory " +
    "with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  );
}

// Instantiate client (using placeholders if not configured so the import doesn't throw)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
