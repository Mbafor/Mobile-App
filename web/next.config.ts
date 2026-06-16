import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Block MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Control referrer information
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Speed up DNS lookups for external resources
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Lock down browser features not used by this site
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Force HTTPS for 1 year (enable only after SSL is confirmed on your domain)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },

  // Serve next/image in modern formats (avif → webp → original)
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Gzip / Brotli all responses
  compress: true,

  // Security headers on every route
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  // Redirect bare domain to www (or vice-versa) — adjust to match your DNS setup
  // async redirects() {
  //   return [
  //     {
  //       source: "/(.*)",
  //       has: [{ type: "host", value: "voila-africa.com" }],
  //       destination: "https://www.voila-africa.com/:path*",
  //       permanent: true,
  //     },
  //   ];
  // },
};

export default nextConfig;
