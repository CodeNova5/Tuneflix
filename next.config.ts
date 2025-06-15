
 import type { NextConfig } from "next";
 
 const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/app/page.tsx",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800",
          },
        ],
      },
      {
        source: "/public/login.html",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
