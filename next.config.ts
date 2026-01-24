import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // External packages that shouldn't be bundled
  serverExternalPackages: ['pdf-parse', '@napi-rs/canvas', 'mammoth', 'better-sqlite3'],

  // Environment variables
  env: {
    APP_NAME: 'SGM Summit Demo',
    APP_TIER: 'summit',
    NEXT_PUBLIC_BINDING_MODE: process.env.BINDING_MODE || 'synthetic',
  },
}

export default nextConfig
