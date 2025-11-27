import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

interface SupabaseError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
  status?: number;
}

export const handleSupabaseError = (error: unknown): string => {
  if (!error) return 'Terjadi kesalahan yang tidak terduga';
  
  const err = error as SupabaseError;
  
  if (err.code === '23505') return 'Data sudah ada dalam sistem';
  if (err.code === '23503') return 'Referensi data tidak valid';
  if (err.code === '23502') return 'Data wajib diisi lengkap';
  
  if (err.code === '42501') return 'Anda tidak memiliki akses untuk operasi ini';
  if (err.code === '42P01') return 'Tabel data tidak ditemukan';
  
  if (err.code === 'PGRST116') return 'Data tidak ditemukan';
  if (err.code === '404') return 'Resource tidak ditemukan';
  
  if (err.message?.includes('JWT')) return 'Sesi telah berakhir, silakan login kembali';
  if (err.message?.includes('Invalid login credentials')) return 'Email atau password salah';
  if (err.message?.includes('Email not confirmed')) return 'Email belum dikonfirmasi';
  
  if (err.message?.includes('Network')) return 'Masalah koneksi jaringan. Silakan coba lagi';
  if (err.message?.includes('ECONNREFUSED')) return 'Koneksi ke server ditolak';
  
  return err.message || 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi nanti.';
};

export const logSupabaseError = (context: string, error: unknown) => {
  const err = error as SupabaseError;
  console.error(`[${context}] Error:`, {
    code: err.code,
    message: err.message,
    status: err.status,
    details: err.details,
  });
};
