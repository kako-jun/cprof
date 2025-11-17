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

/**
 * 色覚シミュレーター
 *
 * 異なる色覚タイプでの見え方を可視化
 */
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

  // 各色覚タイプでのプライマリカラーのシミュレーション
  const simulatedColors = useMemo(() => {
    const primaries = colorPoints.slice(0, 3) // R, G, B

    return visionTypes.map((visionType) => {
      return {
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
      }
    })
  }, [colorPoints])

  const selectedSimulation = simulatedColors.find((s) => s.visionType === selectedVision)

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        色覚シミュレーション
      </h2>

      {profileName && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">プロファイル: {profileName}</p>
      )}

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          色覚タイプを選択:
        </label>
        <select
          value={selectedVision}
          onChange={(e) => setSelectedVision(e.target.value as ColorVisionType)}
          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {visionTypes.map((type) => (
            <option key={type} value={type}>
              {COLOR_VISION_DESCRIPTIONS[type]}
            </option>
          ))}
        </select>
      </div>

      {/* カラー比較 */}
      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          プライマリカラーの見え方:
        </h3>
        {selectedSimulation?.colors.map((color, index) => {
          if (!color) return null

          return (
            <div key={index} className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  {color.label}
                </p>
                <div className="flex gap-2 items-center">
                  {/* オリジナル */}
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">通常色覚</p>
                    <div
                      className="h-12 rounded border-2 border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: color.original }}
                    ></div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-mono">
                      {color.original}
                    </p>
                  </div>

                  {/* 矢印 */}
                  <div className="text-2xl text-gray-400">→</div>

                  {/* シミュレーション */}
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {COLOR_VISION_DESCRIPTIONS[selectedVision]}
                    </p>
                    <div
                      className="h-12 rounded border-2 border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: color.simulated }}
                    ></div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-mono">
                      {color.simulated}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 説明 */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
          色覚タイプについて
        </h3>
        <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          {selectedVision === 'normal' && (
            <p>
              <strong>正常色覚（3色型）:</strong>{' '}
              通常の色覚。L錐体（赤）、M錐体（緑）、S錐体（青）の3種類が正常に機能。
            </p>
          )}
          {selectedVision === 'protanopia' && (
            <p>
              <strong>1型色覚（P型・赤色盲）:</strong>{' '}
              L錐体（赤）が欠損。赤と緑の区別が困難。日本人男性の約1.5%。
            </p>
          )}
          {selectedVision === 'deuteranopia' && (
            <p>
              <strong>2型色覚（D型・緑色盲）:</strong>{' '}
              M錐体（緑）が欠損。赤と緑の区別が困難。日本人男性の約1.0%。
            </p>
          )}
          {selectedVision === 'tritanopia' && (
            <p>
              <strong>3型色覚（T型・青色盲）:</strong>{' '}
              S錐体（青）が欠損。青と黄の区別が困難。非常に稀（0.01%未満）。
            </p>
          )}
          {selectedVision === 'protanomaly' && (
            <p>
              <strong>1型2色覚（赤色弱）:</strong> L錐体（赤）の感度が低い。赤の識別がやや困難。
            </p>
          )}
          {selectedVision === 'deuteranomaly' && (
            <p>
              <strong>2型2色覚（緑色弱）:</strong>{' '}
              M錐体（緑）の感度が低い。緑の識別がやや困難。最も一般的な色覚異常。
            </p>
          )}
          {selectedVision === 'tritanomaly' && (
            <p>
              <strong>3型2色覚（青色弱）:</strong> S錐体（青）の感度が低い。青の識別がやや困難。
            </p>
          )}
          {selectedVision === 'achromatopsia' && (
            <p>
              <strong>全色盲（1色型）:</strong>{' '}
              すべての錐体が機能しない。世界がモノクロに見える。非常に稀。
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 p-3 bg-green-50 dark:bg-green-900 rounded">
        <p className="text-xs text-green-800 dark:text-green-200">
          <strong>アクセシビリティ:</strong>{' '}
          デザインやカラースキームを作成する際、異なる色覚タイプの人々にも識別可能かを確認することが重要です。
        </p>
      </div>
    </div>
  )
}
