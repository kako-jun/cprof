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
    <html lang="ja" className="bg-[#0a0a0a]">
      <body className="antialiased bg-[#0a0a0a] text-[#c8c8c8]">
        {children}
      </body>
    </html>
  )
}
