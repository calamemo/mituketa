"use client";

import { useEffect, useRef } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

export default function UnexploredMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = async () => {
      // 1. 基本設定（apiKeyではなく 'key' を使用し、as anyで型エラーを回避）
      (setOptions as any)({
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        version: "weekly",
      });

      try {
        // 2. 必要なライブラリをロード
        const { Map } = await (importLibrary as any)("maps");
        const { AdvancedMarkerElement } = await (importLibrary as any)("marker");

        // 初期表示：秋葉原（ヴァレ・ラヴァルの活動圏内！）
        const position = { lat: 35.6984, lng: 139.7731 };

        if (!mapRef.current) return;

        // 3. 地図の初期化
        // 注意：mapIdがある場合、stylesプロパティは使用不可（クラウド側で設定）
        const map = new Map(mapRef.current, {
          center: position,
          zoom: 16,
          mapId: "SKOPPA_BASE_MAP_V1", 
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        // 4. 最新のピン（AdvancedMarker）を設置
        new AdvancedMarkerElement({
          map: map,
          position: position,
          title: "SKOPPA 探索拠点",
        });

        // 5. 現在地を取得して地図を移動（ブラウザの許可が必要）
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
        console.error("SKOPPA 地図システム起動失敗:", error);
      }
    };

    initMap();
  }, []);

  return (
    <div className="w-full h-full min-h-[500px] rounded-xl overflow-hidden shadow-lg border-2 border-amber-200">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}