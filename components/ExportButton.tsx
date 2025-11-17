'use client'

import { useState } from 'react'
import type { ICCProfile } from '@/lib/icc-parser'
import { exportProfile, type ExportFormat } from '@/lib/data-export'

interface ExportButtonProps {
  profile: ICCProfile
  profileName?: string
}

/**
 * データエクスポートボタン
 *
 * プロファイルデータを様々な形式でエクスポート
 */
export default function ExportButton({ profile, profileName }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json')

  const formats: { value: ExportFormat; label: string; description: string }[] = [
    {
      value: 'json',
      label: 'JSON',
      description: 'プログラムで読み込み可能な構造化データ',
    },
    {
      value: 'csv',
      label: 'CSV',
      description: 'Excelやスプレッドシートで開ける表形式データ',
    },
    {
      value: 'xyz',
      label: 'XYZ点群',
      description: '3D可視化ツール（Blender等）で使える点群データ',
    },
    {
      value: 'summary',
      label: 'サマリーレポート',
      description: '人間が読めるテキスト形式のレポート',
    },
  ]

  const handleExport = () => {
    try {
      exportProfile(profile, selectedFormat, profileName)
      setIsOpen(false)
    } catch (error) {
      console.error('Export failed:', error)
      alert('エクスポートに失敗しました')
    }
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 text-xs bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
        title="データをエクスポート"
      >
        エクスポート
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                データエクスポート
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {profileName && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{profileName}</p>
            )}

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                エクスポート形式を選択:
              </label>
              <div className="space-y-2">
                {formats.map((format) => (
                  <label
                    key={format.value}
                    className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedFormat === format.value
                        ? 'border-green-500 bg-green-50 dark:bg-green-900'
                        : 'border-gray-300 dark:border-gray-600 hover:border-green-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="export-format"
                      value={format.value}
                      checked={selectedFormat === format.value}
                      onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                        {format.label}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {format.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded mb-4">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <strong>ヒント:</strong>{' '}
                JSON形式は他のツールとの連携に、CSV形式はデータ分析に、XYZ形式は3D可視化に適しています。
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded transition-colors font-semibold"
              >
                ダウンロード
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
