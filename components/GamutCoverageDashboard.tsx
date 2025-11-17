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
}

/**
 * 色域カバレッジダッシュボード
 *
 * 標準色空間との比較を視覚的に表示
 */
export default function GamutCoverageDashboard({
  colorPoints,
  profileName,
}: GamutCoverageDashboardProps) {
  const coverages = useMemo(() => {
    return calculateStandardCoverages(colorPoints)
  }, [colorPoints])

  const gamutArea = useMemo(() => {
    return calculateGamutArea(colorPoints)
  }, [colorPoints])

  const getBarColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 90) return 'bg-blue-500'
    if (percentage >= 70) return 'bg-yellow-500'
    if (percentage >= 50) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getTextColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-700 dark:text-green-400'
    if (percentage >= 90) return 'text-blue-700 dark:text-blue-400'
    if (percentage >= 70) return 'text-yellow-700 dark:text-yellow-400'
    if (percentage >= 50) return 'text-orange-700 dark:text-orange-400'
    return 'text-red-700 dark:text-red-400'
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        色域カバレッジ分析
      </h2>

      {profileName && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">プロファイル: {profileName}</p>
      )}

      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-semibold">色度図上の面積:</span> {gamutArea.toFixed(6)}
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(coverages).map(([key, coverage]) => {
          const standard = STANDARD_COLOR_SPACES[key as keyof typeof STANDARD_COLOR_SPACES]
          const percentage = coverage
          const isWider = percentage > 100

          return (
            <div key={key} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {standard.name}
                  </span>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{standard.description}</p>
                </div>
                <span className={`font-bold text-lg ${getTextColor(percentage)}`}>
                  {percentage.toFixed(1)}%
                </span>
              </div>

              <div className="relative h-8 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getBarColor(percentage)} transition-all duration-500 flex items-center justify-end pr-2`}
                  style={{
                    width: `${Math.min(percentage, 100)}%`,
                  }}
                >
                  {percentage >= 20 && (
                    <span className="text-xs font-semibold text-white">
                      {percentage.toFixed(1)}%
                    </span>
                  )}
                </div>
                {isWider && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      +{(percentage - 100).toFixed(1)}% 広域
                    </span>
                  </div>
                )}
              </div>

              {isWider && (
                <p className="text-xs text-green-600 dark:text-green-400 italic">
                  このプロファイルは {standard.name} よりも広い色域をカバーしています
                </p>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-600">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          カバレッジの見方
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>100%以上: 基準より広い</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>90-100%: ほぼ同等</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>70-90%: やや狭い</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span>50-70%: かなり狭い</span>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          <strong>ヒント:</strong> Web用途なら sRGB 100%以上、印刷なら Adobe RGB
          90%以上が推奨されます。HDR映像には Rec.2020 が必要です。
        </p>
      </div>
    </div>
  )
}
