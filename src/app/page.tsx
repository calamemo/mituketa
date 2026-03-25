import dynamic from 'next/dynamic'

// 地図コンポーネントをブラウザ専用（SSRオフ）で読み込み
// これによりビルド時の Supabase 接続エラーを回避します
const UnexploredMap = dynamic(() => import('@/components/UnexploredMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center border-2 border-slate-200">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-slate-400 font-medium">SKOPPA 起動中...</span>
      </div>
    </div>
  )
})

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
              SKOPPA <span className="text-amber-600">探索マップ</span>
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              現在地を記録して、未踏の地を埋めていくプロジェクト
            </p>
          </div>
          <div className="text-xs text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200 self-start md:self-auto">
            System Version: 1.0.4
          </div>
        </header>

        <section className="bg-white p-3 rounded-[2rem] shadow-2xl shadow-slate-200 border border-slate-200 overflow-hidden">
          <UnexploredMap />
        </section>

        <footer className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</h3>
            <p className="text-slate-700 font-bold mt-1">システム正常稼働中</p>
          </div>
        </footer>
      </div>
    </main>
  )
}