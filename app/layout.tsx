import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'cprof - Color Profile 3D Viewer',
  description: 'ICC/WCS/OCIO color profiles visualizer with interactive 3D display',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
