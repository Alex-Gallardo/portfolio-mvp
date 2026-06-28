import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      { source: "/productos", destination: "/recursos", permanent: true },
      { source: "/productos/:slug", destination: "/recursos/:slug", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" }, // tu bucket público "media"
      { protocol: "https", hostname: "picsum.photos" }, // portadas del seed (pruebas)
      { protocol: "https", hostname: "i.pinimg.com" }, // ← añadido
    ],
  },
};

export default nextConfig;
