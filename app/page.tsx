'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { parseICCProfile, type ICCProfile } from '@/lib/icc-parser'
import ColorSpace2D from '@/components/ColorSpace2D'
import GamutCoverageDashboard from '@/components/GamutCoverageDashboard'
import ShareButton from '@/components/ShareButton'
import ExportButton from '@/components/ExportButton'
import ColorVisionSimulator from '@/components/ColorVisionSimulator'
import { extractProfileFromURL, base64ToFile } from '@/lib/profile-sharing'

const ColorSpaceViewer = dynamic(() => import('@/components/ColorSpaceViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-label text-xs tracking-widest uppercase">
      loading...
    </div>
  ),
})

const SAMPLE_PROFILES = [
  { name: 'sRGB', file: 'sRGB-v4.icc', description: 'Web standard' },
  { name: 'Adobe RGB', file: 'AdobeCompat-v4.icc', description: 'Wide gamut (print)' },
  { name: 'Display P3', file: 'DisplayP3-v4.icc', description: 'Apple wide gamut' },
  { name: 'Rec.2020', file: 'Rec2020-v4.icc', description: '4K/HDR video' },
  { name: 'ProPhoto RGB', file: 'ProPhoto-v4.icc', description: 'Ultra wide (photo editing)' },
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
  const [gradientMode, setGradientMode] = useState(false)
  const [fullGamutMode, setFullGamutMode] = useState(false)
  const [solidOpacity, setSolidOpacity] = useState(0.8)
  const [show2D, setShow2D] = useState(true)

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
      setError(err instanceof Error ? err.message : 'Failed to load sample profile')
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
      setError(err instanceof Error ? err.message : 'Failed to parse profile')
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
        setError(err instanceof Error ? err.message : 'Failed to parse profile')
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
      setError(err instanceof Error ? err.message : 'Failed to parse profile')
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

  useEffect(() => {
    const loadProfileFromURL = async () => {
      const { profile: profileData, name } = extractProfileFromURL()

      if (profileData && name) {
        try {
          setIsLoading(true)
          const file = base64ToFile(profileData, name)
          setSelectedFile(file)
          const parsedProfile = await parseICCProfile(file)
          setProfile(parsedProfile)
        } catch (err) {
          console.error('Failed to load profile from URL:', err)
          setError('Failed to load profile from URL')
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadProfileFromURL()
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* Top bar — wordmark + status */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-4">
          <span className="text-sm font-mono tracking-[0.2em] text-white uppercase">cprof</span>
          <span className="text-xs text-label font-mono">ICC Color Profile Visualizer</span>
        </div>
        <a
          href="https://github.com/kako-jun/cprof"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-label font-mono hover:text-foreground transition-colors"
        >
          GitHub
        </a>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* LEFT SIDEBAR — controls */}
        <aside className="w-64 shrink-0 bg-[#0e0e0e] border-r border-[#1e1e1e] flex flex-col overflow-y-auto">

          {/* Drop zone */}
          <div
            className="mx-3 mt-3 border border-dashed border-[#2e2e2e] p-4 text-center cursor-pointer hover:border-[#444] transition-colors"
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
              <p className="text-xs text-label font-mono leading-relaxed">
                drop .icc / .icm<br />
                or click to open
              </p>
            </label>
          </div>

          {/* Sample presets */}
          <div className="px-3 mt-4">
            <p className="text-[10px] text-dim font-mono uppercase tracking-widest mb-2">Presets</p>
            <div className="flex flex-col gap-1">
              {SAMPLE_PROFILES.map((sample) => (
                <button
                  key={sample.file}
                  onClick={() => loadSampleProfile(sample.file)}
                  disabled={isLoading}
                  title={sample.description}
                  className="text-left px-2 py-1.5 text-xs font-mono text-label hover:text-foreground hover:bg-[#1a1a1a] transition-colors disabled:opacity-40"
                >
                  {sample.name}
                  <span className="text-[10px] text-dim ml-2">{sample.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#1e1e1e] mx-3 mt-4" />

          {/* Display settings */}
          <div className="px-3 mt-4">
            <p className="text-[10px] text-dim font-mono uppercase tracking-widest mb-3">Render</p>

            <label className="flex items-center gap-2 cursor-pointer mb-3 group">
              <input
                type="checkbox"
                checked={gradientMode}
                onChange={(e) => setGradientMode(e.target.checked)}
              />
              <span className="text-xs font-mono text-label group-hover:text-foreground transition-colors">
                gradient solid
              </span>
            </label>

            {gradientMode && (
              <>
                <label className="flex items-center gap-2 cursor-pointer mb-3 ml-4 group">
                  <input
                    type="checkbox"
                    checked={fullGamutMode}
                    onChange={(e) => setFullGamutMode(e.target.checked)}
                  />
                  <span className="text-xs font-mono text-label group-hover:text-foreground transition-colors">
                    full gamut (8pt)
                  </span>
                </label>

                <div className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] font-mono text-dim">opacity</span>
                    <span className="text-[10px] font-mono text-label">{Math.round(solidOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={solidOpacity}
                    onChange={(e) => setSolidOpacity(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </>
            )}

            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={show2D}
                onChange={(e) => setShow2D(e.target.checked)}
              />
              <span className="text-xs font-mono text-label group-hover:text-foreground transition-colors">
                2D projections
              </span>
            </label>
          </div>

          {/* Divider */}
          <div className="border-t border-[#1e1e1e] mx-3 mt-4" />

          {/* Profile 1 info */}
          {selectedFile && (
            <div className="px-3 mt-4">
              <p className="text-[10px] text-dim font-mono uppercase tracking-widest mb-2">Profile A</p>
              <p className="text-xs font-mono text-foreground truncate">{selectedFile.name}</p>
              <p className="text-[10px] font-mono text-dim mt-0.5">{(selectedFile.size / 1024).toFixed(1)} KB</p>

              {profile && (
                <div className="mt-3 space-y-1">
                  {[
                    ['color space', profile.header.colorSpace],
                    ['version', profile.header.version],
                    ['device', profile.header.deviceClass],
                    ['PCS', profile.header.pcs],
                    ['gamut vol', profile.gamutVolume?.toFixed(4) ?? 'N/A'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <span className="text-[10px] font-mono text-dim">{k}</span>
                      <span className="text-[10px] font-mono text-label truncate max-w-[100px] text-right">{v}</span>
                    </div>
                  ))}
                  {profile.description && (
                    <p className="text-[10px] font-mono text-dim mt-1 truncate" title={profile.description}>
                      {profile.description}
                    </p>
                  )}
                  {profile.usingSRGBDefaults && (
                    <div className="mt-2 p-2 bg-[#1a1500] border border-[#332a00]">
                      <p className="text-[10px] font-mono text-[#aa8800] leading-relaxed">
                        Non-RGB profile ({profile.header.colorSpace}). Gamut data shown as sRGB defaults — values are not from the actual profile.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!compareMode && profile && (
                <div className="mt-3 flex flex-col gap-1.5">
                  <ShareButton file={selectedFile} profileName={profile.description || selectedFile.name} />
                  <ExportButton profile={profile} profileName={profile.description || selectedFile.name} />
                  <label
                    htmlFor="file-input-2"
                    className="cursor-pointer px-2 py-1.5 text-xs font-mono text-label border border-[#2e2e2e] hover:border-[#444] hover:text-foreground transition-colors text-center"
                  >
                    + compare
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
          )}

          {/* Profile 2 info */}
          {selectedFile2 && (
            <>
              <div className="border-t border-[#1e1e1e] mx-3 mt-4" />
              <div className="px-3 mt-4">
                <p className="text-[10px] text-dim font-mono uppercase tracking-widest mb-2">Profile B</p>
                <p className="text-xs font-mono text-foreground truncate">{selectedFile2.name}</p>
                <p className="text-[10px] font-mono text-dim mt-0.5">{(selectedFile2.size / 1024).toFixed(1)} KB</p>

                {profile2 && (
                  <div className="mt-3 space-y-1">
                    {[
                      ['color space', profile2.header.colorSpace],
                      ['version', profile2.header.version],
                      ['device', profile2.header.deviceClass],
                      ['PCS', profile2.header.pcs],
                      ['gamut vol', profile2.gamutVolume?.toFixed(4) ?? 'N/A'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-2">
                        <span className="text-[10px] font-mono text-dim">{k}</span>
                        <span className="text-[10px] font-mono text-label truncate max-w-[100px] text-right">{v}</span>
                      </div>
                    ))}
                    {profile2.usingSRGBDefaults && (
                      <div className="mt-2 p-2 bg-[#1a1500] border border-[#332a00]">
                        <p className="text-[10px] font-mono text-[#aa8800] leading-relaxed">
                          Non-RGB profile ({profile2.header.colorSpace}). Gamut data shown as sRGB defaults — values are not from the actual profile.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-3 flex flex-col gap-1.5">
                  {profile2 && (
                    <>
                      <ShareButton file={selectedFile2} profileName={profile2.description || selectedFile2.name} />
                      <ExportButton profile={profile2} profileName={profile2.description || selectedFile2.name} />
                    </>
                  )}
                  <button
                    onClick={clearComparison}
                    className="px-2 py-1.5 text-xs font-mono text-dim border border-[#2e2e2e] hover:border-[#555] hover:text-foreground transition-colors"
                  >
                    remove B
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="mx-3 mt-4 p-3 border border-[#3a1a1a] bg-[#1a0a0a]">
              <p className="text-xs font-mono text-[#cc4444]">{error}</p>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />
        </aside>

        {/* MAIN — 3D canvas fills everything */}
        <main className="flex-1 flex flex-col overflow-hidden">

          {/* 3D viewer — dominates the screen */}
          <div className="flex-1 bg-[#050505] relative min-h-[500px]">
            {isLoading || isLoading2 ? (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-xs font-mono text-label tracking-widest uppercase">parsing...</p>
              </div>
            ) : profile ? (
              <ColorSpaceViewer
                colorPoints={profile.colorPoints}
                profileName={profile.description || selectedFile?.name}
                colorPoints2={profile2?.colorPoints}
                profileName2={profile2?.description || selectedFile2?.name}
                gradientMode={gradientMode}
                fullGamutMode={fullGamutMode}
                solidOpacity={solidOpacity}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <p className="text-xs font-mono text-dim tracking-widest uppercase">no profile loaded</p>
                <p className="text-[10px] font-mono text-[#333]">drop an .icc file or select a preset</p>
              </div>
            )}
          </div>

          {/* Analysis panels — below the 3D view, only when loaded */}
          {profile && (
            <div className="bg-[#0a0a0a] border-t border-[#1e1e1e] overflow-y-auto max-h-[50vh]">
              <div className="p-5 space-y-8">

                {/* Gamut coverage */}
                <GamutCoverageDashboard
                  colorPoints={profile.colorPoints}
                  profileName={profile.description || selectedFile?.name}
                  usingSRGBDefaults={profile.usingSRGBDefaults}
                />

                {profile2 && (
                  <GamutCoverageDashboard
                    colorPoints={profile2.colorPoints}
                    profileName={profile2.description || selectedFile2?.name}
                    usingSRGBDefaults={profile2.usingSRGBDefaults}
                  />
                )}

                {/* Color vision simulation */}
                <ColorVisionSimulator
                  colorPoints={profile.colorPoints}
                  profileName={profile.description || selectedFile?.name}
                />

                {/* 2D projections */}
                {show2D && (
                  <div>
                    <p className="text-[10px] font-mono text-dim uppercase tracking-widest mb-4">2D Projections</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(['xy', 'lab', 'lch', 'rgb-xy', 'rgb-xz', 'rgb-yz'] as const).map((t) => (
                        <ColorSpace2D
                          key={t}
                          colorPoints={profile.colorPoints}
                          profileName={profile.description || selectedFile?.name}
                          type={t}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
