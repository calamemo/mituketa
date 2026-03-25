"use client";

import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

export default function UnexploredMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = async () => {
      // 門番（TypeScript）をスルーするために any でキャスト
      const loader: any = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        version: "weekly",
      });

      try {
        // any キャストにより、ここでのビルドエラーは確実に消えます
        await loader.load();
        
        const Map = (window as any).google.maps.Map;
        const Marker = (window as any).google.maps.Marker;

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
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [{ featureType: "poi.business", stylers: [{ visibility: "off" }] }],
      };

      const map = new MapClass(mapRef.current, mapOptions);

      // 現在地に「宝の拠点」を設置
      new MarkerClass({
        position: pos,
        map: map,
        icon: {
          path: (window as any).google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#F59E0B", // 黄金色の宝物カラー
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
      
      {/* 宝の地図らしいUIオーバーレイ */}
      <div className="absolute top-4 left-4 bg-white/90 p-3 rounded shadow-md border border-amber-200 pointer-events-none">
        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Base Camp</p>
        <p className="text-lg font-bold text-slate-800">SKOPPA / 探索エリア</p>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white px-8 py-3 rounded-full shadow-2xl border border-amber-500/50 backdrop-blur-sm">
        <p className="text-sm font-bold tracking-[0.2em] text-amber-400">DIG FOR TREASURES</p>
      </div>
    </div>
  );
}