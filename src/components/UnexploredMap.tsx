"use client";

import { useEffect, useRef } from "react";
// 大文字の Loader に修正
import { Loader } from "@googlemaps/js-api-loader";

export default function UnexploredMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = async () => {
      // TypeScript のチェックを確実に回避するために any を使います
      const loader: any = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        version: "weekly",
      });

      try {
        // 最近のバージョンでも動作する load メソッドを使用
        await loader.load();
        
        const google = (window as any).google;
        const Map = google.maps.Map;
        const Marker = google.maps.Marker;

        // デフォルトの位置：秋葉原（宝探しの拠点）
        let position = { lat: 35.6984, lng: 139.7731 };

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (success) => {
              position = {
                lat: success.coords.latitude,
                lng: success.coords.longitude,
              };
              renderMap(Map, Marker, position);
            },
            () => {
              renderMap(Map, Marker, position);
            }
          );
        } else {
          renderMap(Map, Marker, position);
        }
      } catch (error) {
        console.error("宝の地図の召喚に失敗しました:", error);
      }
    };

    const renderMap = (MapClass: any, MarkerClass: any, pos: { lat: number, lng: number }) => {
      if (!mapRef.current) return;

      const mapOptions = {
        center: pos,
        zoom: 16,
        mapId: "SKOPPA_TREASURE_MAP",
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [{ featureType: "poi.business", stylers: [{ visibility: "off" }] }],
      };

      const map = new MapClass(mapRef.current, mapOptions);

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
      <div className="absolute top-4 left-4 bg-white/95 p-3 rounded shadow-md border border-amber-200 pointer-events-none">
        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Base Camp</p>
        <p className="text-lg font-bold text-slate-800">SKOPPA / 探索エリア</p>
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-8 py-3 rounded-full shadow-2xl border border-amber-500/50 backdrop-blur-sm">
        <p className="text-sm font-bold tracking-[0.2em] text-amber-400">DIG FOR TREASURES</p>
      </div>
    </div>
  );
}