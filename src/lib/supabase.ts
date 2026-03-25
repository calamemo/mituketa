import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

if (typeof window !== 'undefined') {
  // 実際の値を出すのは危ないので「文字数」だけログに出します
  console.log("🛠️ Debug Supabase Init:");
  console.log("- URL Length:", supabaseUrl.length);
  console.log("- Key Length:", supabaseAnonKey.length);
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)