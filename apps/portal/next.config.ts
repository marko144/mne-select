import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
