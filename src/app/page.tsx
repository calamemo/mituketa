// src/app/page.tsx

import UnexploredMap from "@/components/UnexploredMap";
import packageJson from "../../package.json"; // ヴァージョン情報を取得

export default function Home() {
  const version = packageJson.version;

  return (
    <main className="flex min-h-screen flex-col bg-slate-50">
      <nav className="h-16 flex items-center justify-between px-8 bg-amber-50 border-b border-amber-200">
        <div className="flex flex-col">
          <span className="text-2xl font-black text-amber-900 tracking-tighter italic">SKOPPA</span>
          <span className="text-[10px] text-amber-700 font-bold -mt-1">THE TREASURE MAP</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* ヴァージョン表示 */}
          <span className="text-[10px] font-mono text-amber-600 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
            v{version}
          </span>
          <div className="text-xs font-bold text-amber-800 border-2 border-amber-800 px-3 py-1 rounded">
            AREA: AKIHABARA
          </div>
        </div>
      </nav>

      <div className="flex-1 relative">
        <UnexploredMap />
        
        <div className="absolute top-4 left-4 bg-white/95 p-3 rounded shadow-md border border-amber-200 pointer-events-none">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest leading-none mb-1">Status: Active</p>
          <p className="text-lg font-bold text-slate-800">探索ミッション開始</p>
        </div>
      </div>
    </main>
  );
}