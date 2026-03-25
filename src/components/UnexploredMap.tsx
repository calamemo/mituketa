"use client";

import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { supabase } from "@/lib/supabase"; // ここを Supabase に変更

export default function UnexploredMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const initMap = async () => {
      (setOptions as any)({
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        version: "weekly",
      });

      try {
        const { Map } = await (importLibrary as any)("maps");
        const { AdvancedMarkerElement } = await (importLibrary as any)("marker");

        if (!mapRef.current) return;

        const map = new Map(mapRef.current, {
          center: { lat: 35.6984, lng: 139.7731 },
          zoom: 15,
          mapId: "SKOPPA_BASE_MAP_V1",
        });

        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition((pos) => {
            const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setCurrentPos(coords);
            map.setCenter(coords);
            new AdvancedMarkerElement({ map, position: coords, title: "現在地" });
          });
        }
      } catch (e) { console.error(e); }
    };
    initMap();
  }, []);

  const handleSaveLocation = async () => {
    if (!currentPos) return;
  
    // 1. ログインユーザーの情報を取得
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!user) {
      alert("ログインが必要です");
      return;
    }
  
    setIsSaving(true);
  
    // 2. 新しいテーブル定義に合わせて insert
    const { error } = await supabase
      .from('visited_places')
      .insert([
        { 
          user_id: user.id,          // RLSポリシーを通すために必須
          place_name: "探索地点",    // カラム名を place_name に修正
          lat: currentPos.lat, 
          lng: currentPos.lng 
        }
      ]);
  
    if (error) {
      console.error("保存失敗:", error);
      alert(`エラー: ${error.message}`);
    } else {
      alert("Supabaseに保存しました！");
    }
    setIsSaving(false);
  };

  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden shadow-lg border-2 border-amber-200">
      <div ref={mapRef} className="w-full h-full" />
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <button
          onClick={handleSaveLocation}
          disabled={isSaving || !currentPos}
          className="bg-amber-600 text-white px-8 py-3 rounded-full font-bold shadow-xl hover:bg-amber-700 disabled:bg-gray-400"
        >
          {isSaving ? "保存中..." : "ここを探索済みにする"}
        </button>
      </div>
    </div>
  );
}