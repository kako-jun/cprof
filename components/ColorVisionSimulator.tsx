'use client'

import { useState, useMemo } from 'react'
import type { ColorPoint } from '@/lib/icc-parser'
import {
  simulateColorVision,
  hexToRgb,
  rgbToHex,
  type ColorVisionType,
  COLOR_VISION_DESCRIPTIONS,
} from '@/lib/color-vision'

interface ColorVisionSimulatorProps {
  colorPoints: ColorPoint[]
  profileName?: string
}

export default function ColorVisionSimulator({
  colorPoints,
  profileName,
}: ColorVisionSimulatorProps) {
  const [selectedVision, setSelectedVision] = useState<ColorVisionType>('normal')

  const visionTypes: ColorVisionType[] = [
    'normal',
    'protanopia',
    'deuteranopia',
    'tritanopia',
    'protanomaly',
    'deuteranomaly',
    'tritanomaly',
    'achromatopsia',
  ]

  const simulatedColors = useMemo(() => {
    const primaries = colorPoints.slice(0, 3)

    return visionTypes.map((visionType) => ({
      visionType,
      colors: primaries.map((point) => {
        if (!point.color) return null
        const rgb = hexToRgb(point.color)
        const simulated = simulateColorVision(rgb, visionType)
        return {
          original: point.color,
          simulated: rgbToHex(simulated),
          label: point.label || '',
        }
      }),
    }))
  }, [colorPoints])

  const selectedSimulation = simulatedColors.find((s) => s.visionType === selectedVision)

  return (
    <div className="w-full">
      <p className="text-[10px] font-mono text-dim uppercase tracking-widest mb-4">
        Color Vision Simulation
        {profileName && <span className="ml-3 text-label normal-case tracking-normal">{profileName}</span>}
      </p>

      {/* Vision type selector */}
      <div className="mb-5">
        <p className="text-[10px] font-mono text-dim mb-2">vision type</p>
        <select
          value={selectedVision}
          onChange={(e) => setSelectedVision(e.target.value as ColorVisionType)}
          className="w-full px-3 py-2 bg-[#111] border border-[#2a2a2a] text-xs font-mono text-label focus:border-[#444] transition-colors"
        >
          {visionTypes.map((type) => (
            <option key={type} value={type}>
              {COLOR_VISION_DESCRIPTIONS[type]}
            </option>
          ))}
        </select>
      </div>

      {/* Color swatches — the actual colors are the content, UI stays neutral */}
      <div className="space-y-4 mb-5">
        {selectedSimulation?.colors.map((color, index) => {
          if (!color) return null

          return (
            <div key={index}>
              <p className="text-[10px] font-mono text-dim mb-2">{color.label}</p>
              <div className="flex items-stretch gap-3">
                {/* Original swatch */}
                <div className="flex-1">
                  <div
                    className="h-10 w-full"
                    style={{ backgroundColor: color.original }}
                  />
                  <p className="text-[10px] font-mono text-dim mt-1">normal</p>
                  <p className="text-[10px] font-mono text-label">{color.original}</p>
                </div>

                <div className="flex items-center text-dim text-xs font-mono self-center">→</div>

                {/* Simulated swatch */}
                <div className="flex-1">
                  <div
                    className="h-10 w-full"
                    style={{ backgroundColor: color.simulated }}
                  />
                  <p className="text-[10px] font-mono text-dim mt-1">simulated</p>
                  <p className="text-[10px] font-mono text-label">{color.simulated}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Description */}
      <div className="p-3 bg-[#0e0e0e] border border-[#1e1e1e]">
        <p className="text-[10px] font-mono text-dim leading-relaxed">
          {selectedVision === 'normal' && 'Normal trichromacy — L, M, S cones all functional.'}
          {selectedVision === 'protanopia' && 'Protanopia (P-type) — L cone absent. Red-green confusion. ~1.5% of males (JP).'}
          {selectedVision === 'deuteranopia' && 'Deuteranopia (D-type) — M cone absent. Red-green confusion. ~1.0% of males (JP).'}
          {selectedVision === 'tritanopia' && 'Tritanopia (T-type) — S cone absent. Blue-yellow confusion. Very rare (<0.01%).'}
          {selectedVision === 'protanomaly' && 'Protanomaly — reduced L cone sensitivity. Mild red discrimination loss.'}
          {selectedVision === 'deuteranomaly' && 'Deuteranomaly — reduced M cone sensitivity. Most common color vision deficiency.'}
          {selectedVision === 'tritanomaly' && 'Tritanomaly — reduced S cone sensitivity. Mild blue discrimination loss.'}
          {selectedVision === 'achromatopsia' && 'Achromatopsia — all cones non-functional. World appears monochrome. Very rare.'}
        </p>
      </div>
    </div>
  )
}
