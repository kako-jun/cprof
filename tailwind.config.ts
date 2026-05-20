import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',
        border: 'var(--border)',
        'border-2': 'var(--border-2)',
        muted: 'var(--muted)',
        dim: 'var(--text-dim)',
        label: 'var(--text-label)',
      },
      fontFamily: {
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'Cascadia Code',
          'ui-monospace',
          'Courier New',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
}

export default config
