import UnexploredMap from '@/components/UnexploredMap';

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-orange-50 text-black">
// src/app/page.tsx 内の該当箇所
      <h1 className="text-2xl font-bold">SKOPPA</h1>
      <UnexploredMap />
    </main>
  );
}

// src/app/page.tsx 内のヘッダー部分
<nav className="h-16 flex items-center justify-between px-8 bg-amber-50 border-b border-amber-200">
  <div className="flex flex-col">
    <span className="text-2xl font-black text-amber-900 tracking-tighter italic">SKOPPA</span>
    <span className="text-[10px] text-amber-700 font-bold -mt-1">THE TREASURE MAP</span>
  </div>
  <div className="text-xs font-bold text-amber-800 border-2 border-amber-800 px-3 py-1 rounded">
    AREA: AKIHABARA
  </div>
</nav>