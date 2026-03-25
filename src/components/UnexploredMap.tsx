"use client";

import { useEffect, useRef } from "react";
// * を使ってインポートすることで、名前の不整合を回避します
import * as GoogleMapsApi from "@googlemaps/js-api-loader";

export default function UnexploredMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = async () => {
      // 最新バージョンのシングルトン・インスタンスを取得
      const api = (GoogleMapsApi as any).loader || new (GoogleMapsApi as any).Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        version: "weekly",
      });

      // 新しい関数型APIの設定方法
      if (api.setOptions) {
        api.setOptions({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
          version: "weekly",
        });
      }

      try {
        // エラーメッセージの指示通り importLibrary を使用
        const { Map } = await api.importLibrary("maps");
        const { Marker } = await api.importLibrary("marker");

        // デフォルト：秋葉原
        let position = { lat: 35.6984, lng: 139.7731 };

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (success) => {
              position = { lat: success.coords.latitude, lng: success.coords.longitude };
              renderMap(Map, Marker, position);
            },
            () => renderMap(Map, Marker, position)
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

      const map = new MapClass(mapRef.current, {
        center: pos,
        zoom: 16,
        mapId: "SKOPPA_MAP",
        mapTypeControl: false,
        streetViewControl: false,
      });

      new MarkerClass({ position: pos, map: map, title: "Base Camp" });
    };

    initMap();
  }, []);

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-[calc(100vh-64px)]" />
      <div className="absolute top-4 left-4 bg-white/95 p-3 rounded shadow-md border border-amber-200">
        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Base Camp</p>
        <p className="text-lg font-bold text-slate-800">SKOPPA / 探索エリア</p>
      </div>
    </div>
  );
}