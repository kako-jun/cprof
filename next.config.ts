import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'
const isGitHubPages = process.env.GITHUB_PAGES === 'true'

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isProd && isGitHubPages ? '/cprof' : '',
  images: {
    unoptimized: true,
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
