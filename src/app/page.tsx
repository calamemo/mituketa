import UnexploredMap from '@/components/UnexploredMap';

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-orange-50 text-black">
      <h1 className="text-3xl font-bold text-orange-600 mb-4">ミツケタ</h1>
      <UnexploredMap />
    </main>
  );
}