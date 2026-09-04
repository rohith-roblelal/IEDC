import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== 'production';

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL 
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname 
  : 'batgdzgscdshjzmaufri.supabase.co';

const csp = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://${supabaseHost} https://iedcsnmimt.vercel.app;
  connect-src 'self' https://${supabaseHost} https://*.sentry.io;
  font-src 'self' data:;
  media-src 'self' https://${supabaseHost};
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
`.replace(/\s{2,}/g, ' ').trim();

const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  {
    key: 'Content-Security-Policy',
    value: csp,
  }
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/(.*\\.(?:svg|png|jpg|jpeg|webp|avif|ico|mp4))$',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'stale-while-revalidate=60',
          }
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHost,
      },
      {
        protocol: 'https',
        hostname: 'iedcsnmimt.vercel.app',
      },
    ],
  },
  // Allow local network devices (e.g. phones, other machines) to access
  // the Next.js dev server without cross-origin resource blocks.
  // This setting has zero effect in production builds.
  allowedDevOrigins: ['192.168.1.36', '192.168.1.*'],
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

export default withSentryConfig(withBundleAnalyzer(nextConfig), {
  silent: true,
  org: "iedc-snmimt",
  project: "frontend",
});
