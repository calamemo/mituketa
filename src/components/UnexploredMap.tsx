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

  // リストと表示の管理
  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);
  const [showNeverAgain, setShowNeverAgain] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false); // ボトムシートの開閉状態

  const markersRef = useRef<any[]>([]);
  const [MarkerClasses, setMarkerClasses] = useState<any>(null);

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

  useEffect(() => {
    if (!user) return;

    const initMap = async () => {
      (setOptions as any)({
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        version: "weekly",
      });

      try {
        const { Map } = await (importLibrary as any)("maps");
        const markerLib = await (importLibrary as any)("marker");
        const placesLib = await (importLibrary as any)("places");
        
        setMarkerClasses(markerLib);

        if (!mapRef.current) return;

        const gMap = new Map(mapRef.current, {
          center: { lat: 35.6984, lng: 139.7731 },
          zoom: 16,
          mapId: "SKOPPA_BASE_MAP_V1",
          disableDefaultUI: true, // Google標準の邪魔なUIを消す
          zoomControl: true,
        });
        setMap(gMap);

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

  const loadSavedPlaces = useCallback(async () => {
    if (!map || !user || !MarkerClasses) return;

    markersRef.current.forEach(marker => { marker.map = null; });
    markersRef.current = [];

    const { AdvancedMarkerElement, PinElement } = MarkerClasses;

    const { data, error } = await supabase
      .from('visited_places')
      .select('*')
      .eq('user_id', user.id)
      .order('visited_at', { ascending: false }); // 新しい順

    if (error) {
      console.error("データ取得エラー:", error);
      return;
    }

    setSavedPlaces(data || []); // リスト表示用にデータを保存

    data?.forEach((place) => {
      if (place.status === 'never_again' && !showNeverAgain) return;
      
      let bgColor = '#3b82f6'; 
      let borderColor = '#1d4ed8';

      if (place.status === 'good_value') {
        bgColor = '#3b82f6';
        borderColor = '#1d4ed8';
      } else if (place.status === 'reward') {
        bgColor = '#f59e0b';
        borderColor = '#d97706';
      } else if (place.status === 'never_again') {
        bgColor = '#64748b';
        borderColor = '#334155';
      }
      
      const pinStyle = new PinElement({
        background: bgColor,
        borderColor: borderColor,
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
  }, [map, user, MarkerClasses, showNeverAgain]);

  useEffect(() => {
    loadSavedPlaces();
  }, [loadSavedPlaces]);

  const handleSaveLocation = async (recordType: 'good_value' | 'reward' | 'never_again') => {
    if (!currentPos || !user) return;
    setIsSaving(true);

    const saveToDB = async (placeName: string) => {
      const { error } = await supabase.from('visited_places').insert([{ 
          user_id: user.id,
          place_name: placeName,
          lat: currentPos.lat, 
          lng: currentPos.lng,
          status: recordType
      }]);

      if (!error) {
        loadSavedPlaces();
      }
      setIsSaving(false);
    };

    if (placesService) {
      placesService.nearbySearch({
        location: currentPos,
        radius: 30,
      }, (results: any, status: any) => {
        let name = "記録した場所";
        if (status === 'OK' && results && results.length > 0) {
          name = results[0].name;
        }
        saveToDB(name);
      });
    } else {
      saveToDB("記録した場所");
    }
  };

  // 現在地へ戻る関数
  const handleRecenter = () => {
    if (map && currentPos) {
      map.panTo(currentPos);
      map.setZoom(16);
    }
  };

  if (isAuthChecking) return <div className="h-[100dvh] bg-slate-100" />;

  if (!user) {
    return (
      <div className="w-full h-[100dvh] bg-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-black text-slate-800 mb-2">ミツケタ</h2>
        <p className="text-slate-500 mb-8 font-medium">自分だけのパーソナルマップ</p>
        <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold shadow-xl transition-all w-full max-w-sm">
          Googleでログインして始める
        </button>
      </div>
    );
  }

  // リストに表示するデータをフィルタリング
  const displayPlaces = savedPlaces.filter(p => showNeverAgain ? true : p.status !== 'never_again');

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-slate-100">
      
      {/* 検索バー風のヘッダー（浮き出し） */}
      <div className="absolute top-4 left-4 right-4 z-10 flex gap-2 pointer-events-none">
        <div className="flex-1 pointer-events-auto bg-white rounded-full shadow-lg px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-slate-700 truncate">ミツケタ</span>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            <input type="checkbox" checked={showNeverAgain} onChange={(e) => setShowNeverAgain(e.target.checked)} className="accent-slate-600 w-3 h-3"/>
            ノイズ表示
          </label>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="pointer-events-auto bg-white rounded-full w-12 h-12 shadow-lg flex items-center justify-center text-xl overflow-hidden border-2 border-transparent hover:border-slate-200">
          <img src={user.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt="User" className="w-full h-full object-cover"/>
        </button>
      </div>

      {/* 地図本体 */}
      <div ref={mapRef} className="absolute inset-0 w-full h-full" />
      
      {/* 現在地ボタン */}
      <div className="absolute right-4 bottom-40 z-10 transition-transform duration-300" style={{ transform: isListOpen ? 'translateY(-40dvh)' : 'translateY(0)' }}>
        <button onClick={handleRecenter} className="bg-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-slate-50">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path><circle cx="12" cy="12" r="3" fill="currentColor"></circle></svg>
        </button>
      </div>

      {/* 評価ボタン（リストの上に浮く） */}
      <div className="absolute left-0 right-0 bottom-20 z-10 px-4 flex gap-2 transition-transform duration-300 pointer-events-none" style={{ transform: isListOpen ? 'translateY(-40dvh)' : 'translateY(0)' }}>
        <div className="w-full max-w-md mx-auto flex gap-2 pointer-events-auto">
          <button onClick={() => handleSaveLocation('good_value')} disabled={isSaving || !currentPos} className="flex-1 bg-blue-600 text-white py-3 px-1 rounded-2xl font-bold shadow-[0_4px_15px_rgba(37,99,235,0.4)] active:scale-95 text-sm flex flex-col items-center justify-center gap-1">
            <span className="text-xl">👍</span><span>マタクルネ</span>
          </button>
          <button onClick={() => handleSaveLocation('reward')} disabled={isSaving || !currentPos} className="flex-1 bg-amber-500 text-white py-3 px-1 rounded-2xl font-bold shadow-[0_4px_15px_rgba(245,158,11,0.4)] active:scale-95 text-sm flex flex-col items-center justify-center gap-1">
            <span className="text-xl">✨</span><span>ご褒美</span>
          </button>
          <button onClick={() => handleSaveLocation('never_again')} disabled={isSaving || !currentPos} className="w-[72px] shrink-0 bg-slate-700 text-white py-3 rounded-2xl font-bold shadow-[0_4px_15px_rgba(51,65,85,0.4)] active:scale-95 text-sm flex flex-col items-center justify-center gap-1">
            <span className="text-xl">👎</span><span className="text-[10px]">封印</span>
          </button>
        </div>
      </div>

      {/* ボトムシート（保存リスト） */}
      <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-all duration-300 z-20 flex flex-col ${isListOpen ? 'h-[50dvh]' : 'h-16'}`}>
        
        {/* 引き出しハンドル部分 */}
        <div onClick={() => setIsListOpen(!isListOpen)} className="h-16 shrink-0 flex items-center justify-center cursor-pointer relative border-b border-slate-100">
          <div className="absolute top-2 w-10 h-1.5 bg-slate-300 rounded-full"></div>
          <span className="font-bold text-slate-700 flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10