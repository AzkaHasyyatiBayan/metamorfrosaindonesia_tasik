import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Interface untuk menangani struktur error umum dari Supabase/PostgreSQL
interface SupabaseError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

export const handleSupabaseError = (error: unknown): string => {
  if (!error) return 'Unknown error occurred';
  
  // Casting error ke tipe SupabaseError agar properti code/message bisa diakses
  const err = error as SupabaseError;
  
  if (err.code === '23505') return 'Data sudah ada dalam sistem';
  if (err.code === '42501') return 'Anda tidak memiliki akses untuk operasi ini';
  if (err.code === 'PGRST116') return 'Data tidak ditemukan';
  if (err.message?.includes('JWT')) return 'Sesi telah berakhir, silakan login kembali';
  
  return err.message || 'Terjadi kesalahan yang tidak terduga';
};