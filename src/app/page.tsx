"use client";

import dynamic from 'next/dynamic'

const UnexploredMap = dynamic(() => import('@/components/UnexploredMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-[100dvh] w-full bg-slate-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-slate-500 font-bold">マップを読み込み中...</span>
      </div>
    </div>
  )
})

export default function Home() {
  return (
    <main className="w-screen h-[100dvh] overflow-hidden bg-slate-100">
      <UnexploredMap />
    </main>
  )
}