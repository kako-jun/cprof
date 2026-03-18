'use client'

import { useMemo } from 'react'
import type { ColorPoint } from '@/lib/icc-parser'
import {
  calculateStandardCoverages,
  calculateGamutArea,
  STANDARD_COLOR_SPACES,
} from '@/lib/gamut-coverage'

interface GamutCoverageDashboardProps {
  colorPoints: ColorPoint[]
  profileName?: string
  usingSRGBDefaults?: boolean
}

export default function GamutCoverageDashboard({
  colorPoints,
  profileName,
  usingSRGBDefaults,
}: GamutCoverageDashboardProps) {
  const coverages = useMemo(() => calculateStandardCoverages(colorPoints), [colorPoints])
  const gamutArea = useMemo(() => calculateGamutArea(colorPoints), [colorPoints])

  return (
    <div className="w-full">
      <p className="text-[10px] font-mono text-dim uppercase tracking-widest mb-4">
        Gamut Coverage
        {profileName && <span className="ml-3 text-label normal-case tracking-normal">{profileName}</span>}
      </p>

      {usingSRGBDefaults && (
        <div className="mb-4 p-3 bg-[#1a1500] border border-[#332a00]">
          <p className="text-[10px] font-mono text-[#aa8800] leading-relaxed">
            This profile uses a non-RGB color space. Coverage values below reflect sRGB defaults, not the actual profile gamut.
          </p>
        </div>
      )}

      <div className="mb-4 flex gap-6">
        <div>
          <span className="text-[10px] font-mono text-dim">chromaticity area</span>
          <span className="ml-2 text-xs font-mono text-label">{gamutArea.toFixed(6)}</span>
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(coverages).map(([key, coverage]) => {
          const standard = STANDARD_COLOR_SPACES[key as keyof typeof STANDARD_COLOR_SPACES]
          const percentage = coverage
          const clamped = Math.min(percentage, 100)
          const isWider = percentage > 100

          // Brightness of bar scales with percentage — purely gray
          const barBrightness = Math.round(20 + (clamped / 100) * 50)

          return (
            <div key={key}>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs font-mono text-label">{standard.name}</span>
                <span className="text-xs font-mono text-foreground tabular-nums">
                  {percentage.toFixed(1)}%
                  {isWider && (
                    <span className="text-[10px] text-dim ml-1">+{(percentage - 100).toFixed(1)}</span>
                  )}
                </span>
              </div>

              {/* Flat gray bar — no color */}
              <div className="h-1.5 bg-[#1a1a1a] w-full">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${clamped}%`,
                    background: `rgb(${barBrightness}, ${barBrightness}, ${barBrightness})`,
                  }}
                />
              </div>

              <p className="text-[10px] font-mono text-[#333] mt-0.5">{standard.description}</p>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 pt-4 border-t border-[#1a1a1a]">
        <p className="text-[10px] font-mono text-[#333]">
          bar brightness scales linearly with coverage / 100
        </p>
      </div>

      <div className="mt-3 p-3 bg-[#0e0e0e] border border-[#1e1e1e]">
        <p className="text-[10px] font-mono text-dim leading-relaxed">
          Web: sRGB &ge;100% &nbsp;|&nbsp; Print: Adobe RGB &ge;90% &nbsp;|&nbsp; HDR: Rec.2020
        </p>
      </div>
    </div>
  )
}
