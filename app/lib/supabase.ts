import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Define proper error type for Supabase
interface SupabaseError {
  message: string
  details?: string
  hint?: string
  code?: string
}

export function handleSupabaseError(error: unknown): never {
  console.error('Supabase error:', error)
  
  if (error instanceof Error) {
    throw new Error(`Database error: ${error.message}`)
  }
  
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const supabaseError = error as SupabaseError
    throw new Error(supabaseError.message || 'Database error occurred')
  }
  
  throw new Error('An unexpected database error occurred')
}