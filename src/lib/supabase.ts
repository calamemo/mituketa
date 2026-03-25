import { createClient } from '@supabase/supabase-js'

// ! をつけることで「絶対に環境変数は存在する」とTypeScriptに教えます
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// もし読み込めていなかったら、コンソールに赤いエラーを出す
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("🚨 環境変数（Supabase URL / Key）が読み込めていません！ .env.local を確認してサーバーを再起動してください。")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)