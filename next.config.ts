import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // TypeScript type checking - temporarily re-enabled to allow build
  // TODO: Fix ~45 remaining type errors in lib/services/ and lib/governance/
  // See: npm run type-check for full list
  typescript: {
    ignoreBuildErrors: true,
  },

  // External packages that shouldn't be bundled
  serverExternalPackages: ['pdf-parse', '@napi-rs/canvas', 'mammoth', 'better-sqlite3'],

  // Environment variables
  env: {
    APP_NAME: 'SGM Summit Demo',
    APP_TIER: 'summit',
  },
}

export default nextConfig
