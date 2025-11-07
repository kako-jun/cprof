import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
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
