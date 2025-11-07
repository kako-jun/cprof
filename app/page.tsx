'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { parseICCProfile, type ICCProfile } from '@/lib/icc-parser'

// Three.jsコンポーネントはクライアントサイドのみで動作
const ColorSpaceViewer = dynamic(() => import('@/components/ColorSpaceViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-gray-600">
      読み込み中...
    </div>
  ),
})

const SAMPLE_PROFILES = [
  { name: 'sRGB', file: 'sRGB-v4.icc', description: '標準色域（Web）' },
  { name: 'Adobe RGB', file: 'AdobeCompat-v4.icc', description: '広色域（印刷）' },
  { name: 'Display P3', file: 'DisplayP3-v4.icc', description: 'Apple向け広色域' },
  { name: 'Rec.2020', file: 'Rec2020-v4.icc', description: '4K/HDR映像用' },
  { name: 'ProPhoto RGB', file: 'ProPhoto-v4.icc', description: '超広色域（写真編集）' },
]

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [profile, setProfile] = useState<ICCProfile | null>(null)
  const [selectedFile2, setSelectedFile2] = useState<File | null>(null)
  const [profile2, setProfile2] = useState<ICCProfile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoading2, setIsLoading2] = useState(false)
  const [compareMode, setCompareMode] = useState(false)

  const loadSampleProfile = async (filename: string) => {
    setError(null)
    setIsLoading(true)

    try {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
      const response = await fetch(`${basePath}/profiles/${filename}`)
      if (!response.ok) throw new Error(`Failed to load ${filename}`)

      const blob = await response.blob()
      const file = new File([blob], filename, { type: 'application/octet-stream' })

      setSelectedFile(file)
      const parsedProfile = await parseICCProfile(file)
      setProfile(parsedProfile)
    } catch (err) {
      console.error('Sample profile loading error:', err)
      setError(err instanceof Error ? err.message : 'サンプルプロファイルの読み込みに失敗しました')
      setProfile(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setError(null)
    setIsLoading(true)

    try {
      const parsedProfile = await parseICCProfile(file)
      setProfile(parsedProfile)
    } catch (err) {
      console.error('ICC parsing error:', err)
      setError(err instanceof Error ? err.message : 'プロファイルの解析に失敗しました')
      setProfile(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]

    if (file && (file.name.endsWith('.icc') || file.name.endsWith('.icm'))) {
      setSelectedFile(file)
      setError(null)
      setIsLoading(true)

      try {
        const parsedProfile = await parseICCProfile(file)
        setProfile(parsedProfile)
      } catch (err) {
        console.error('ICC parsing error:', err)
        setError(err instanceof Error ? err.message : 'プロファイルの解析に失敗しました')
        setProfile(null)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleFileChange2 = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile2(file)
    setError(null)
    setIsLoading2(true)

    try {
      const parsedProfile = await parseICCProfile(file)
      setProfile2(parsedProfile)
      setCompareMode(true)
    } catch (err) {
      console.error('ICC parsing error:', err)
      setError(err instanceof Error ? err.message : 'プロファイルの解析に失敗しました')
      setProfile2(null)
    } finally {
      setIsLoading2(false)
    }
  }

  const clearComparison = () => {
    setSelectedFile2(null)
    setProfile2(null)
    setCompareMode(false)
  }

  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 items-center">
        <h1 className="text-4xl font-bold text-center">
          cprof
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Color Profile 3D Viewer
        </p>

        <div className="flex flex-col gap-4 items-center w-full max-w-4xl">
          <div
            className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              type="file"
              accept=".icc,.icm"
              onChange={handleFileChange}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="cursor-pointer block">
              <div className="text-gray-600 dark:text-gray-400">
                <p className="mb-2">ICC/ICMプロファイルをドロップ</p>
                <p className="text-sm">またはクリックして選択</p>
              </div>
            </label>
          </div>

          {/* サンプルプロファイル選択 */}
          <div className="w-full">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              またはサンプルを試す:
            </p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PROFILES.map((sample) => (
                <button
                  key={sample.file}
                  onClick={() => loadSampleProfile(sample.file)}
                  className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors"
                  title={sample.description}
                  disabled={isLoading}
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>

          {selectedFile && (
            <div className="w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">プロファイル 1:</span> {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    サイズ: {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>

                  {profile && (
                    <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-semibold">色空間:</span> {profile.header.colorSpace}
                        </div>
                        <div>
                          <span className="font-semibold">バージョン:</span> {profile.header.version}
                        </div>
                        <div>
                          <span className="font-semibold">デバイス:</span> {profile.header.deviceClass}
                        </div>
                        <div>
                          <span className="font-semibold">PCS:</span> {profile.header.pcs}
                        </div>
                        <div className="col-span-2">
                          <span className="font-semibold">色域体積:</span> {profile.gamutVolume?.toFixed(6) ?? 'N/A'}
                          {profile2 && profile.gamutVolume && profile2.gamutVolume && (
                            <span className="ml-2 text-gray-500">
                              (比率: {(profile.gamutVolume / profile2.gamutVolume).toFixed(2)}x)
                            </span>
                          )}
                        </div>
                      </div>
                      {profile.description && (
                        <p className="text-xs mt-2">
                          <span className="font-semibold">説明:</span> {profile.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {!compareMode && profile && (
                  <div className="ml-4">
                    <label
                      htmlFor="file-input-2"
                      className="cursor-pointer px-3 py-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                    >
                      + 比較
                    </label>
                    <input
                      type="file"
                      accept=".icc,.icm"
                      onChange={handleFileChange2}
                      className="hidden"
                      id="file-input-2"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedFile2 && (
            <div className="w-full p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">プロファイル 2:</span> {selectedFile2.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    サイズ: {(selectedFile2.size / 1024).toFixed(2)} KB
                  </p>

                  {profile2 && (
                    <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-semibold">色空間:</span> {profile2.header.colorSpace}
                        </div>
                        <div>
                          <span className="font-semibold">バージョン:</span> {profile2.header.version}
                        </div>
                        <div>
                          <span className="font-semibold">デバイス:</span> {profile2.header.deviceClass}
                        </div>
                        <div>
                          <span className="font-semibold">PCS:</span> {profile2.header.pcs}
                        </div>
                        <div className="col-span-2">
                          <span className="font-semibold">色域体積:</span> {profile2.gamutVolume?.toFixed(6) ?? 'N/A'}
                          {profile && profile.gamutVolume && profile2.gamutVolume && (
                            <span className="ml-2 text-gray-500">
                              (比率: {(profile2.gamutVolume / profile.gamutVolume).toFixed(2)}x)
                            </span>
                          )}
                        </div>
                      </div>
                      {profile2.description && (
                        <p className="text-xs mt-2">
                          <span className="font-semibold">説明:</span> {profile2.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={clearComparison}
                  className="ml-4 px-3 py-1.5 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                >
                  削除
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="w-full p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
              <p className="text-sm">⚠️ {error}</p>
            </div>
          )}

          <div className="w-full h-[600px] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            {isLoading || isLoading2 ? (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-600 dark:text-gray-400">解析中...</p>
              </div>
            ) : profile ? (
              <ColorSpaceViewer
                colorPoints={profile.colorPoints}
                profileName={profile.description || selectedFile?.name}
                colorPoints2={profile2?.colorPoints}
                profileName2={profile2?.description || selectedFile2?.name}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-600 dark:text-gray-400">
                  プロファイルを選択すると3D表示されます
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <a
            href="https://github.com/kako-jun/cprof"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 rounded-lg hover:opacity-80 transition-opacity"
          >
            GitHub
          </a>
        </div>
      </main>
    </div>
  )
}
