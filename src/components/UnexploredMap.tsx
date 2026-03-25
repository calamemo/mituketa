"use client";

import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { db, auth } from "@/lib/firebase"; // Firebase初期化ファイルが必要
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function UnexploredMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
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

        const defaultPos = { lat: 35.6984, lng: 139.7731 }; // 秋葉原

        if (!mapRef.current) return;

        const gMap = new Map(mapRef.current, {
          center: defaultPos,
          zoom: 15,
          mapId: "SKOPPA_BASE_MAP_V1",
          disableDefaultUI: false,
        });
        setMap(gMap);

        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition((position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setCurrentPos(pos);
            gMap.setCenter(pos);

            new AdvancedMarkerElement({
              map: gMap,
              position: pos,
              title: "現在地",
            });
          });
        }
      } catch (error) {
        console.error("地図の初期化失敗:", error);
      }
    };

    initMap();
  }, []);

  // Firestoreに場所を保存する関数
  const handleSaveLocation = async () => {
    if (!currentPos || !auth.currentUser) {
      alert(auth.currentUser ? "現在地を取得中です" : "ログインが必要です");
      return;
    }

    setIsSaving(true);
    try {
      await addDoc(collection(db, "visited_places"), {
        userId: auth.currentUser.uid,
        location: currentPos,
        timestamp: serverTimestamp(),
        name: "探索済みの地点", // 後で入力可能にしてもOK
      });
      alert("この地点をマークしました！");
    } catch (error) {
      console.error("保存失敗:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden shadow-lg border-2 border-amber-200 bg-slate-100">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* 保存ボタンを地図上に浮かせる */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <button
          onClick={handleSaveLocation}
          disabled={isSaving || !currentPos}
          className={`px-6 py-3 rounded-full font-bold text-white shadow-xl transition-all ${
            isSaving ? "bg-gray-400" : "bg-amber-600 hover:bg-amber-700 active:scale-95"
          }`}
        >
          {isSaving ? "保存中..." : "ここを探索済みにする"}
        </button>
      </div>
    </div>
  );
}