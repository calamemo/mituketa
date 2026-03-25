"use client";

import { useEffect, useRef } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

export default function UnexploredMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // デバッグ用ログ：コンポーネントが読み込まれたか確認
    console.log("UnexploredMap mounted");
    
    // APIキーの読み込みチェック（ブラウザのF12コンソールに出ます）
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      console.error("API KEY IS MISSING! Check your .env.local file.");
      return;
    }

    const initMap = async () => {
      // 1. 基本設定（apiKeyではなく 'key' を使用し、as anyで型エラーを回避）
      (setOptions as any)({
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        version: "weekly",
      });

      try {
        console.log("Loading Maps libraries...");
        // 2. 必要なライブラリをロード
        const { Map } = await (importLibrary as any)("maps");
        const { AdvancedMarkerElement } = await (importLibrary as any)("marker");
        console.log("Libraries loaded successfully");

        // 初期表示：秋葉原
        const position = { lat: 35.6984, lng: 139.7731 };

        if (!mapRef.current) {
          console.error("mapRef.current is null");
          return;
        }

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
        console.log("Map instance created");

        // 4. 最新のピン（AdvancedMarker）を設置
        new AdvancedMarkerElement({
          map: map,
          position: position,
          title: "SKOPPA 探索拠点",
        });

      } catch (error) {
        console.error("SKOPPA 地図システム起動失敗:", error);
      }
    };

    initMap();
  }, []);

  // 🛡️ JSXの return 部分：ここで潰れないように高さを強制します
  return (
    // 親要素にインラインスタイルで高さ 500px を強制
    // bg-gray-100 を付けて、コンポーネントが存在するか視認できるようにしています
    <div 
      style={{ height: '500px', width: '100%' }} 
      className="rounded-xl overflow-hidden shadow-lg border-2 border-amber-200 bg-gray-100 relative"
    >
      {/* 内側の地図表示用Divにも高さを強制 */}
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      
      {/* フォールバックメッセージ：もし地図が出なくてもグレーの四角の中にこれが表示されます */}
      <div className="absolute inset-0 flex items-center justify-center text-amber-900 font-bold opacity-50 pointer-events-none">
         地図を読み込み中... (表示されない場合はF12コンソールを確認)
      </div>
    </div>
  );
}