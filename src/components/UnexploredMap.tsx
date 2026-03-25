"use client";

import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

export default function UnexploredMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        version: "weekly",
      });

      try {
        // 1. まずAPIをロードする（安定した方法）
        await loader.load();
        
        // 2. グローバルな google オブジェクトから直接 Map クラスを取得
        const Map = google.maps.Map;

        // デフォルトの位置：秋葉原駅周辺（冒険の拠点）
        let position = { lat: 35.6984, lng: 139.7731 };

        // ブラウザの現在地取得を試みる
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (success) => {
              position = {
                lat: success.coords.latitude,
                lng: success.coords.longitude,
              };
              renderMap(Map, position);
            },
            () => {
              renderMap(Map, position);
            }
          );
        } else {
          renderMap(Map, position);
        }
      } catch (error) {
        console.error("宝の地図の召喚に失敗しました:", error);
      }
    };

    const renderMap = (MapClass: typeof google.maps.Map, pos: { lat: number, lng: number }) => {
      if (!mapRef.current) return;

      const mapOptions: google.maps.MapOptions = {
        center: pos,
        zoom: 16,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [{ featureType: "poi.business", stylers: [{ visibility: "off" }] }],
      };

      const map = new MapClass(mapRef.current, mapOptions);

      // 拠点の「X」印（マーカー）を設置
      new google.maps.Marker({
        position: pos,
        map: map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#F59E0B",
          fillOpacity: 1,
          strokeWeight: 3,
          strokeColor: "#FFFFFF",
        },
      });
    };

    initMap();
  }, []);

  return (
    <div className="w-full h-full relative font-sans">
      <div ref={mapRef} className="w-full h-[calc(100vh-64px)]" />
      <div className="absolute top-4 left-4 bg-white/90 p-3 rounded shadow-md border border-slate-200 pointer-events-none">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Base Camp</p>
        <p className="text-lg font-bold">SKOPPA / 探索エリア</p>
      </div>
    </div>
  );
}