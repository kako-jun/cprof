import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'
const isGitHubPages = process.env.GITHUB_PAGES === 'true'
const basePath = isProd && isGitHubPages ? '/cprof' : ''

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  webpack: (config) => {
    // WebAssemblyサポート
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }

    // .wasmファイルをアセットとして扱う
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    })

    return config
  },
}

export default nextConfig
