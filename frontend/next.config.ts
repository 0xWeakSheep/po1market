import type { NextConfig } from "next";

/**
 * Optional: set `BACKEND_PROXY_TARGET=http://127.0.0.1:3001` in `.env.local` and
 * `NEXT_PUBLIC_API_BASE_URL=/api/po1market` so the browser hits same-origin and
 * Next proxies to Nest (no CORS). Nest lives in repo folder `backend/`.
 */
const nextConfig: NextConfig = {
  async rewrites() {
    const target = process.env.BACKEND_PROXY_TARGET?.trim();
    if (!target) return [];
    const base = target.replace(/\/$/, "");
    return [{ source: "/api/po1market/:path*", destination: `${base}/:path*` }];
  },
};

export default nextConfig;
