"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { supabase } from "@/lib/supabase";

export default function UnexploredMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [placesService, setPlacesService] = useState<any>(null);
  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // ノイズ（二度と行かない店）を表示するかどうかのトグル
  const [showNeverAgain, setShowNeverAgain] = useState(false);

  // 描画したピンを管理する配列（再描画時に古いピンを消すため）
  const markersRef = useRef<any[]>([]);
  const [MarkerClasses, setMarkerClasses] = useState<any>(null);

  // ログイン状態の監視
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAuthChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 地図とPlaces APIの初期化
  useEffect(() => {
    // ログインしていない場合は地図を読み込まない
    if (!user) return;

    const initMap = async () => {
      (setOptions as any)({
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        version: "weekly",
      });

      try {
        const { Map } = await (importLibrary as any)("maps");
        const markerLib = await (importLibrary as any)("marker");
        const placesLib = await (importLibrary as any)("places"); // 施設名取得用
        
        setMarkerClasses(markerLib);

        if (!mapRef.current) return;

        const gMap = new Map(mapRef.current, {
          center: { lat: 35.6984, lng: 139.7731 },
          zoom: 16,
          mapId: "SKOPPA_BASE_MAP_V1",
        });
        setMap(gMap);

        // PlacesServiceの初期化
        const service = new placesLib.PlacesService(gMap);
        setPlacesService(service);

        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              setCurrentPos(coords);
              gMap.setCenter(coords);
              
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
  }, [user]);

  // Supabaseからデータを取得してピンを立てる
  const loadSavedPlaces = useCallback(async () => {
    if (!map || !user || !MarkerClasses) return;

    // 古いピンを地図から消去
    markersRef.current.forEach(marker => { marker.map = null; });
    markersRef.current = [];

    const { AdvancedMarkerElement, PinElement } = MarkerClasses;

    const { data, error } = await supabase
      .from('visited_places')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error("データ取得エラー:", error);
      return;
    }

    data?.forEach((place) => {
      const isVisited = place.status === 'visited';
      
      // ノイズキャンセル：二度と行かない店で、かつ非表示設定ならスキップ
      if (!isVisited && !showNeverAgain) return;
      
      const pinStyle = new PinElement({
        background: isVisited ? '#3b82f6' : '#64748b',
        borderColor: isVisited ? '#1d4ed8' : '#334155',
        glyphColor: 'white',
      });

      const marker = new AdvancedMarkerElement({
        map: map,
        position: { lat: place.lat, lng: place.lng },
        content: pinStyle.element,
        title: place.place_name,
      });

      markersRef.current.push(marker);
    });
  }, [map, user, MarkerClasses, showNeverAgain]); // トグルが切り替わったら再実行

  useEffect(() => {
    loadSavedPlaces();
  }, [loadSavedPlaces]);

  const handleSaveLocation = async (recordType: 'visited' | 'never_again') => {
    if (!currentPos || !user) return;
    setIsSaving(true);

    // データベースに保存する共通関数
    const saveToDB = async (placeName: string) => {
      const { error } = await supabase.from('visited_places').insert([{ 
          user_id: user.id,
          place_name: placeName,
          lat: currentPos.lat, 
          lng: currentPos.lng,
          status: recordType
      }]);

      if (error) {
        alert(`エラー: ${error.message}`);
      } else {
        alert(placeName + " を記録しました！");
        loadSavedPlaces();
      }
      setIsSaving(false);
    };

    // 周辺の施設名を検索
    if (placesService) {
      placesService.nearbySearch({
        location: currentPos,
        radius: 30, // 30m以内の施設を探す
      }, (results: any, status: any) => {
        let name = recordType === 'visited' ? "行ったお店" : "二度と行かない店";
        // 施設が見つかったらその名前を採用
        if (status === 'OK' && results && results.length > 0) {
          name = results[0].name;
        }
        saveToDB(name);
      });
    } else {
      saveToDB(recordType === 'visited' ? "行ったお店" : "二度と行かない店");
    }
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // 認証チェック中は何も表示しない（チラつき防止）
  if (isAuthChecking) return <div className="h-[600px] bg-slate-100 rounded-xl" />;

  // 未ログイン時の画面（ログインウォール）
  if (!user) {
    return (
      <div className="w-full h-[600px] rounded-xl shadow-lg border-2 border-slate-200 bg-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-black text-slate-800 mb-2">ミツケタへようこそ</h2>
        <p className="text-slate-500 mb-8">自分だけのパーソナルマップを作るには、Googleアカウントでログインしてください。</p>
        <button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all flex items-center gap-2">
          Googleでログインして始める
        </button>
      </div>
    );
  }

  // ログイン済みの画面
  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden shadow-lg border-2 border-slate-200 bg-slate-100 flex flex-col">
      {/* 上部コントロールパネル */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
        
        {/* ノイズキャンセルトグル */}
        <div className="pointer-events-auto bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-md">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700">
            <input 
              type="checkbox" 
              checked={showNeverAgain} 
              onChange={(e) => setShowNeverAgain(e.target.checked)}
              className="accent-slate-600 w-4 h-4"
            />
            ノイズ（👎）を表示
          </label>
        </div>

        {/* ユーザー情報＆ログアウト */}
        <div className="pointer-events-auto bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-md flex items-center gap-3">
          <span className="text-sm font-bold text-slate-700 truncate max-w-[100px]">{user.email?.split('@')[0]}</span>
          <div className="w-px h-4 bg-slate-300"></div>
          <button onClick={handleLogout} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors">ログアウト</button>
        </div>
      </div>

      <div ref={mapRef} className="w-full h-full" />
      
      {/* 下部の保存ボタンエリア */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-3 w-full max-w-md px-4">
        {!currentPos ? (
          <div className="w-full bg-white text-center py-3 rounded-xl shadow-xl font-bold text-slate-500 animate-pulse">
            現在地を取得中...
          </div>
        ) : (
          <>
            <button onClick={() => handleSaveLocation('visited')} disabled={isSaving} className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-bold shadow-xl hover:bg-blue-600 transition-all">
              👍 行った！
            </button>
            <button onClick={() => handleSaveLocation('never_again')} disabled={isSaving} className="flex-1 bg-slate-600 text-white py-3 rounded-xl font-bold shadow-xl hover:bg-slate-700 transition-all">
              👎 封印する
            </button>
          </>
        )}
      </div>
    </div>
  );
}