"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { supabase } from "@/lib/supabase";

export default function UnexploredMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Google Maps APIのクラスを保持する用
  const [MarkerClasses, setMarkerClasses] = useState<any>(null);

  // 1. ログイン状態の監視
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. 地図の初期化
  useEffect(() => {
    const initMap = async () => {
      (setOptions as any)({
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        version: "weekly",
      });

      try {
        const { Map } = await (importLibrary as any)("maps");
        const markerLib = await (importLibrary as any)("marker");
        setMarkerClasses(markerLib); // AdvancedMarkerElementとPinElementを保存

        if (!mapRef.current) return;

        const gMap = new Map(mapRef.current, {
          center: { lat: 35.6984, lng: 139.7731 },
          zoom: 15,
          mapId: "SKOPPA_BASE_MAP_V1",
        });
        setMap(gMap);

        // 現在地の取得
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              setCurrentPos(coords);
              gMap.setCenter(coords);
              
              // 現在地は標準の赤ピン
              new markerLib.AdvancedMarkerElement({ 
                map: gMap, 
                position: coords, 
                title: "現在地" 
              });
            },
            (err) => console.warn("GPS取得スキップ:", err.message),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
          );
        }
      } catch (error) {
        console.error("地図初期化エラー:", error);
      }
    };

    initMap();
  }, []);

  // 3. Supabaseからデータを取得してピンを立てる
  const loadSavedPlaces = useCallback(async () => {
    if (!map || !user || !MarkerClasses) return;

    const { AdvancedMarkerElement, PinElement } = MarkerClasses;

    // 自分の記録だけを取得
    const { data, error } = await supabase
      .from('visited_places')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error("データ取得エラー:", error);
      return;
    }

    // 取得したデータをループして地図に配置
    data?.forEach((place) => {
      // 評価によってピンの色を変える
      const isVisited = place.status === 'visited';
      
      const pinStyle = new PinElement({
        background: isVisited ? '#3b82f6' : '#64748b', // 青(行った) or グレー(二度と行かない)
        borderColor: isVisited ? '#1d4ed8' : '#334155',
        glyphColor: 'white',
      });

      new AdvancedMarkerElement({
        map: map,
        position: { lat: place.lat, lng: place.lng },
        content: pinStyle.element, // 色を変えたピンを適用
        title: place.place_name,
      });
    });
  }, [map, user, MarkerClasses]);

  // マップとユーザー情報が揃ったらデータを読み込む
  useEffect(() => {
    loadSavedPlaces();
  }, [loadSavedPlaces]);

  // 4. 保存処理（変更なし）
  const handleSaveLocation = async (status: 'visited' | 'never_again') => {
    if (!currentPos || !user) return;
    setIsSaving(true);

    const { error } = await supabase
      .from('visited_places')
      .insert([{ 
          user_id: user.id,
          place_name: status === 'visited' ? "行ったお店" : "二度と行かない店",
          lat: currentPos.lat, 
          lng: currentPos.lng,
          status: status
      }]);

    if (error) {
      alert(`エラー: ${error.message}`);
    } else {
      alert("保存しました！");
      loadSavedPlaces(); // 保存直後にピンを再描画する
    }
    setIsSaving(false);
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden shadow-lg border-2 border-slate-200 bg-slate-100 flex flex-col">
      <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-md flex items-center gap-3">
        {user ? (
          <>
            <span className="text-sm font-bold text-slate-700">ログイン中</span>
            <button onClick={handleLogout} className="text-xs text-red-500 hover:underline">ログアウト</button>
          </>
        ) : (
          <button onClick={handleLogin} className="text-sm font-bold text-blue-600 hover:underline">Googleでログイン</button>
        )}
      </div>

      <div ref={mapRef} className="w-full h-full" />
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-3 w-full max-w-md px-4">
        {!user ? (
          <div className="w-full bg-white text-center py-3 rounded-xl shadow-xl font-bold text-slate-500 border border-slate-200">
            記録するにはログインしてください
          </div>
        ) : !currentPos ? (
          <div className="w-full bg-white text-center py-3 rounded-xl shadow-xl font-bold text-slate-500 border border-slate-200 animate-pulse">
            現在地を取得中...
          </div>
        ) : (
          <>
            <button onClick={() => handleSaveLocation('visited')} disabled={isSaving} className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-bold shadow-xl hover:bg-blue-600">
              👍 行った！
            </button>
            <button onClick={() => handleSaveLocation('never_again')} disabled={isSaving} className="flex-1 bg-slate-600 text-white py-3 rounded-xl font-bold shadow-xl hover:bg-slate-700">
              👎 二度と行かない
            </button>
          </>
        )}
      </div>
    </div>
  );
}