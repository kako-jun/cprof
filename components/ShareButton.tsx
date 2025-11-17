'use client'

import { useState } from 'react'
import { generateShareLink, copyToClipboard } from '@/lib/profile-sharing'

interface ShareButtonProps {
  file: File
  profileName?: string
}

/**
 * プロファイル共有ボタン
 *
 * URLをクリップボードにコピーする機能を提供
 */
export default function ShareButton({ file, profileName }: ShareButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [shareURL, setShareURL] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateLink = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const url = await generateShareLink(file)
      setShareURL(url)
    } catch (err) {
      console.error('Share link generation error:', err)
      setError(err instanceof Error ? err.message : '共有リンクの生成に失敗しました')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (!shareURL) return

    const success = await copyToClipboard(shareURL)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } else {
      setError('クリップボードへのコピーに失敗しました')
    }
  }

  const handleClose = () => {
    setShareURL(null)
    setCopied(false)
    setError(null)
  }

  return (
    <div>
      {!shareURL ? (
        <button
          onClick={handleGenerateLink}
          disabled={isGenerating}
          className="px-3 py-1.5 text-xs bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white rounded transition-colors"
          title="このプロファイルを共有"
        >
          {isGenerating ? '生成中...' : '共有'}
        </button>
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                プロファイルを共有
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {profileName && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{profileName}</p>
            )}

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                共有URL:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareURL}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onClick={(e) => e.currentTarget.select()}
                />
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2 text-sm font-semibold rounded transition-colors ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                >
                  {copied ? 'コピー完了!' : 'コピー'}
                </button>
              </div>
            </div>

            {shareURL.length > 2048 && (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900 rounded">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  ⚠️
                  URLが長すぎます。一部のブラウザやアプリケーションで正しく動作しない可能性があります。
                </p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 rounded">
                <p className="text-xs text-red-800 dark:text-red-200">⚠️ {error}</p>
              </div>
            )}

            <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <strong>使い方:</strong>{' '}
                このURLを共有すると、相手はブラウザで直接プロファイルを表示できます。URLパラメータにプロファイルデータが含まれています。
              </p>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
