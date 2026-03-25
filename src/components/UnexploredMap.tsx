"use client";

import { useEffect, useRef } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

export default function UnexploredMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = async () => {
      // 1. APIキー設定
      (setOptions as any)({
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        version: "weekly",
      });

      try {
        const { Map } = await (importLibrary as any)("maps");
        const { AdvancedMarkerElement } = await (importLibrary as any)("marker");

        // デフォルト位置（秋葉原）
        const defaultPos = { lat: 35.6984, lng: 139.7731 };

        if (!mapRef.current) return;

        // 2. 地図の初期化（一旦秋葉原で作成）
        const map = new Map(mapRef.current, {
          center: defaultPos,
          zoom: 15,
          mapId: "SKOPPA_BASE_MAP_V1",
          disableDefaultUI: false,
        });

        // 3. 現在地を取得して地図を移動させるロジック
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const currentPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };

              console.log("現在地を取得しました:", currentPos);

              // 地図の中心を現在地に移動
              map.setCenter(currentPos);

              // 現在地にピンを立てる
              new AdvancedMarkerElement({
                map: map,
                position: currentPos,
                title: "あなたの現在地",
              });
            },
            (error) => {
              console.warn("位置情報の取得に失敗しました:", error.message);
              // 失敗した場合は秋葉原のままにする
            },
            {
              enableHighAccuracy: true, // 高精度な位置情報を要求
              timeout: 5000,
              maximumAge: 0,
            }
          );
        }

      } catch (error) {
        console.error("地図の初期化に失敗:", error);
      }
    };

    initMap();
  }, []);

  return (
    <div className="w-full" style={{ height: '600px' }}>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-xl shadow-lg border-2 border-amber-200"
      />
    </div>
  );
}