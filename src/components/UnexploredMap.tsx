"use client";

import { useEffect, useRef } from "react";
// 関数型APIを直接インポート
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

export default function UnexploredMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = async () => {
      // TypeScriptの型エラーを回避するために 'as any' を追加
      setOptions({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        version: "weekly",
      } as any);

      try {
        // importLibrary も any キャストで安全に呼び出し
        const { Map } = await (importLibrary as any)("maps");
        const { Marker } = await (importLibrary as any)("marker");

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
        console.error("SKOPPA 起動エラー:", error);
      }
    };

    const renderMap = (MapClass: any, MarkerClass: any, pos: { lat: number, lng: number }) => {
      if (!mapRef.current) return;

      const map = new MapClass(mapRef.current, {
        center: pos,
        zoom: 16,
        mapId: "SKOPPA_BASE_MAP",
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

  return <div ref={mapRef} className="w-full h-full" />;
}