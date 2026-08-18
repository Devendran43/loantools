import type { NextConfig } from "next";

/**
 * Content-Security-Policy for a fully static, client-only financial
 * calculator that optionally loads Google AdSense.
 *
 * Trade-offs, documented deliberately (both verified against an actual
 * production build, not just assumed):
 *
 * - `style-src` includes 'unsafe-inline' because the UI relies on React's
 *   `style={{...}}` attribute for values only known at render time (chart
 *   arc lengths, bar widths, gradient stops).
 * - `script-src` also includes 'unsafe-inline': Next.js's own production
 *   client bootstrap (confirmed via `next build && next start`, not just
 *   dev mode) injects a small inline script, which a strict script-src
 *   silently breaks the whole app for. Removing this need entirely requires
 *   a nonce-based CSP, which in turn requires opting every page into dynamic
 *   (per-request) rendering — sacrificing the static prerendering this app
 *   depends on for its "instant load, no server" goal. Every *external*
 *   script source is still explicitly allow-listed (self + AdSense only);
 *   this only affects Next's own same-origin inline bootstrap.
 */
const isDev = process.env.NODE_ENV === "development";

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://*.googlesyndication.com",
  "font-src 'self' data:",
  "connect-src 'self' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
  "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  // No inline data ever needs to leak the framework version to clients.
  poweredByHeader: false,
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
