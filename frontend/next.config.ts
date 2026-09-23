import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure consistent URLs (no trailing slash redirects)
  trailingSlash: false,
  // Remove X-Powered-By header
  poweredByHeader: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "thehotreports.com" },
      { protocol: "https", hostname: "**.cloudfront.net" },
      { protocol: "https", hostname: "www.thehotreports.com" },
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "http", hostname: "**" },
    ],
  },
  headers: async () => {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      // CSP: Allow scripts from self, Google Ads, and Vercel; allow unsafe-eval for some third-party libs
      {
        key: "Content-Security-Policy",
        value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://pagead2.googlesyndication.com https://*.adtrafficquality.google https://*.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: http://localhost:* http://127.0.0.1:*; connect-src 'self' http://localhost:* http://127.0.0.1:* https://api.thehotreports.com https://*.cloudfront.net https://*.vercel-scripts.com https://ep1.adtrafficquality.google https://*.google.com; font-src 'self'; frame-src https://googleads.g.doubleclick.net https://*.adtrafficquality.google https://www.google.com; object-src 'none'; base-uri 'self'; form-action 'self';"
      },
    ];
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
