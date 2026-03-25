import { createClient } from '@supabase/supabase-js'

// 名前を .env と完全に一致させます
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ビルド時に undefined だとエラーになるため、空文字をフォールバックに入れます
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
)