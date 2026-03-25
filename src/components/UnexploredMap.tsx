"use client";

import { useEffect, useRef } from "react";
// Loader クラスではなく、小文字の loader オブジェクトを直接使うのが最新流です
import { loader } from "@googlemaps/js-api-loader";

export default function UnexploredMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = async () => {
      // 指示通り setOptions を使用
      loader.setOptions({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        version: "weekly",
      });

      try {
        // 指示通り importLibrary を使用してライブラリを取得
        const { Map } = await loader.importLibrary("maps") as any;
        const { Marker } = await loader.importLibrary("marker") as any;

        let position = { lat: 35.6984, lng: 139.7731 }; // 秋葉原

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (success) => {
              position = {
                lat: success.coords.latitude,
                lng: success.coords.longitude,
              };
              renderMap(Map, Marker, position);
            },
            () => renderMap(Map, Marker, position)
          );
        } else {
          renderMap(Map, Marker, position);
        }
      } catch (error) {
        console.error("地図の召喚に失敗しました:", error);
      }
    };

    const renderMap = (MapClass: any, MarkerClass: any, pos: { lat: number, lng: number }) => {
      if (!mapRef.current) return;

      const map = new MapClass(mapRef.current, {
        center: pos,
        zoom: 16,
        mapId: "SKOPPA_BASE_MAP", // 最新 API では Map ID が推奨されます
        mapTypeControl: false,
        streetViewControl: false,
      });

      new MarkerClass({
        position: pos,
        map: map,
        title: "現在の拠点",
      });
    };

    initMap();
  }, []);

  return (
    <div className="w-full h-full relative font-sans">
      <div ref={mapRef} className="w-full h-[calc(100vh-64px)]" />
      <div className="absolute top-4 left-4 bg-white/95 p-3 rounded shadow-md border border-amber-200">
        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Base Camp</p>
        <p className="text-lg font-bold text-slate-800">SKOPPA / 探索エリア</p>
      </div>
    </div>
  );
}