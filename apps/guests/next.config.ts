import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  transpilePackages: [
    '@mne-select/ui',
    '@mne-select/design-system',
    '@mne-select/auth',
    '@mne-select/shared-types',
    '@mne-select/shared-utils',
    '@mne-select/supabase-client',
  ],
}

export default nextConfig
