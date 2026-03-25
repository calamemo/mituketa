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
        // (loader as any) とすることで、TypeScriptの門番をスルーさせます
        const { Map } = await (loader as any).importLibrary("maps");
        const { Marker } = await (loader as any).importLibrary("marker");

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
        console.error("SKOPPA Map Error:", error);
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
        title: "Base Camp",
      });
    };

    initMap();
  }, []);

  return <div ref={mapRef} className="w-full h-full" />;
}