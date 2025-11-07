'use client'

import { useState } from 'react'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
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

        <div className="flex flex-col gap-4 items-center w-full max-w-md">
          <div className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".icc,.icm"
              onChange={handleFileChange}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="cursor-pointer block"
            >
              <div className="text-gray-600 dark:text-gray-400">
                <p className="mb-2">ICC/ICMプロファイルをドロップ</p>
                <p className="text-sm">またはクリックして選択</p>
              </div>
            </label>
          </div>

          {selectedFile && (
            <div className="w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-sm">
                <span className="font-semibold">選択中:</span> {selectedFile.name}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                サイズ: {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}

          <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-gray-600 dark:text-gray-400">
              3D表示エリア（開発中）
            </p>
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
