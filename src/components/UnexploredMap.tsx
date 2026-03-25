"use client";

import { useEffect, useRef } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

export default function UnexploredMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = async () => {
      // 1. 設定の流し込み（'key' というプロパティ名に修正し、as any で型エラーを回避）
      (setOptions as any)({
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        version: "weekly",
      });

      try {
        // 2. 必要なライブラリを非同期でロード
        const { Map } = await (importLibrary as any)("maps");
        const { AdvancedMarkerElement } = await (importLibrary as any)("marker");

        // 探索の起点：秋葉原
        const position = { lat: 35.6984, lng: 139.7731 };

        if (!mapRef.current) return;

        // 3. 地図の初期化
        const map = new Map(mapRef.current, {
          center: position,
          zoom: 16,
          // AdvancedMarkerElement を使うために必須のID
          mapId: "SKOPPA_BASE_MAP_V1", 
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          
          // 【Erikaさんのこだわり】特定のお店（ビジネスラベル）を非表示にする設定
          styles: [
            {
              featureType: "poi.business",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        });

        // 4. 最新のピン（AdvancedMarker）を立てる
        new AdvancedMarkerElement({
          map: map,
          position: position,
          title: "SKOPPA 探索拠点",
        });

        // 5. 【おまけ】現在地を取得して地図を移動させる
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((success) => {
            const currentPos = {
              lat: success.coords.latitude,
              lng: success.coords.longitude,
            };
            map.setCenter(currentPos);
            new AdvancedMarkerElement({
              map: map,
              position: currentPos,
              title: "あなたの現在地",
            });
          });
        }

      } catch (error) {
        console.error("SKOPPA システム起動失敗:", error);
      }
    };

    initMap();
  }, []);

  return (
    <div className="w-full h-full min-h-[500px] rounded-xl overflow-hidden shadow-inner border-4 border-amber-100">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}