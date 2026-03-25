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
        const { Map } = await loader.importLibrary("maps");

        // 1. デフォルトの位置（現在地が取れなかった時のバックアップ：秋葉原）
        let position = { lat: 35.6984, lng: 139.7731 };

        // 2. ブラウザの現在地取得を試みる
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (success) => {
              position = {
                lat: success.coords.latitude,
                lng: success.coords.longitude,
              };
              renderMap(Map, position);
            },
            (error) => {
              console.warn("現在地の取得に失敗しました。デフォルト位置を表示します。", error);
              renderMap(Map, position);
            }
          );
        } else {
          renderMap(Map, position);
        }
      } catch (error) {
        console.error("地図の召喚に失敗しました:", error);
      }
    };

    // 実際の地図描画処理を関数化
    const renderMap = (Map: any, pos: { lat: number, lng: number }) => {
      if (!mapRef.current) return;

      const mapOptions: google.maps.MapOptions = {
        center: pos,
        zoom: 16,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        // 宝の地図らしいスタイル（任意）
        styles: [{ featureType: "poi.business", stylers: [{ visibility: "off" }] }],
      };

      const map = new Map(mapRef.current, mapOptions);

      // 現在地に「宝の拠点」マーカーを設置
      new google.maps.Marker({
        position: pos,
        map: map,
        title: "現在の拠点",
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
      
      {/* エリア情報の表示を動的に */}
      <div className="absolute top-4 left-4 bg-white/90 p-3 rounded shadow-md border border-slate-200 pointer-events-none">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Base Camp</p>
        <p className="text-lg font-bold">現在地周辺 / 探索エリア</p>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-8 py-3 rounded-full shadow-2xl border border-amber-500/50 backdrop-blur-sm">
        <p className="text-sm font-bold tracking-[0.2em]">DIG FROM YOUR BASE</p>
      </div>
    </div>
  );
}