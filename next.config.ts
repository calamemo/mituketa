/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // これを追加！
  images: {
    unoptimized: true, // 静的書き出しでは画像最適化が使えないため、これも追加
  },
};

export default nextConfig;