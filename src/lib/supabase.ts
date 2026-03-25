import { createClient } from '@supabase/supabase-js'

// NEXT_PUBLIC_ はブラウザに公開される変数
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// ブラウザのコンソールで「何が足りないか」を直接見られるようにします
if (typeof window !== 'undefined') {
  if (!supabaseUrl) console.warn("🚨 NEXT_PUBLIC_SUPABASE_URL が空です");
  if (!supabaseAnonKey) console.warn("🚨 NEXT_PUBLIC_SUPABASE_ANON_KEY が空です");
}

// URLが空でも、とりあえずクライアント作成を試みてクラッシュを防ぐ
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
)