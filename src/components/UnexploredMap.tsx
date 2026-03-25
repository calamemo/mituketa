"use client";

import { useEffect, useRef } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

export default function UnexploredMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = async () => {
      // プロパティ名を "key" に直接指定し、anyでキャストして変換ロジックを回避します
      const options: any = {
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        version: "weekly",
      };
      
      setOptions(options);

      try {
        const { Map } = await importLibrary("maps") as any;
        
        if (mapRef.current) {
          new Map(mapRef.current, {
            center: { lat: 35.72, lng: 139.92 }, // 本八幡周辺
            zoom: 15,
            mapId: "NEXT_MAP_ID",
          });
        }
      } catch (error) {
        console.error("Map loading error:", error);
      }
    };

    initMap();
  }, []);

  return (
    <div className="w-full h-[500px] rounded-xl border-2 border-orange-200 overflow-hidden shadow-lg bg-orange-50">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}