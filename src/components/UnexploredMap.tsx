"use client";

import { useEffect, useRef } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
// インポート文の確認（これが必要です！）
import { Loader } from "@googlemaps/js-api-loader";


export default function UnexploredMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = async () => {
      // 設計図（大文字のLoader）から、実体（小文字のloader）を作るイメージです
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
      version: "weekly",
      libraries: ["maps", "marker"]
    });

      // デバッグ用：ターミナルではなくブラウザのコンソールにキーの冒頭だけ出す
      console.log("Using API Key starting with:", process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.substring(0, 8));

      try {
        // 2. 最新のライブラリをロード
        const { Map } = await (importLibrary as any)("maps");
        const { AdvancedMarkerElement } = await (importLibrary as any)("marker");

        const position = { lat: 35.6984, lng: 139.7731 }; // 秋葉原

        if (!mapRef.current) return;

        const map = new Map(mapRef.current, {
          center: position,
          zoom: 16,
          // AdvancedMarkerElement を使うには mapId が必須です
          mapId: "SKOPPA_BASE_MAP_01",
          mapTypeControl: false,
          streetViewControl: false,
        });

        // 3. 警告に出ていた AdvancedMarkerElement を使用
        new AdvancedMarkerElement({
          map: map,
          position: position,
          title: "SKOPPA 探索拠点",
        });

      } catch (error) {
        console.error("Maps 起動エラー:", error);
      }
    };

    initMap();
  }, []);

  return <div ref={mapRef} className="w-full h-full min-h-[400px]" />;
}