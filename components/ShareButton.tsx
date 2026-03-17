'use client'

import { useState } from 'react'
import { generateShareLink, copyToClipboard } from '@/lib/profile-sharing'

interface ShareButtonProps {
  file: File
  profileName?: string
}

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
      setError(err instanceof Error ? err.message : 'Failed to generate share link')
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
      setError('Failed to copy to clipboard')
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
          className="px-2 py-1.5 text-xs font-mono text-label border border-[#2e2e2e] hover:border-[#444] hover:text-foreground transition-colors disabled:opacity-40 w-full"
        >
          {isGenerating ? 'generating...' : 'share'}
        </button>
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
          <div className="bg-[#111] border border-[#2a2a2a] p-6 max-w-2xl w-full">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-mono text-foreground uppercase tracking-widest">Share Profile</p>
              <button
                onClick={handleClose}
                className="text-dim hover:text-foreground font-mono text-sm transition-colors"
              >
                x
              </button>
            </div>

            {profileName && (
              <p className="text-xs font-mono text-label mb-4">{profileName}</p>
            )}

            <div className="mb-4">
              <p className="text-[10px] font-mono text-dim mb-2 uppercase tracking-widest">share url</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareURL}
                  readOnly
                  className="flex-1 px-3 py-2 text-xs font-mono bg-[#0a0a0a] border border-[#2a2a2a] text-label focus:outline-none focus:border-[#444]"
                  onClick={(e) => e.currentTarget.select()}
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 text-xs font-mono border border-[#2a2a2a] hover:border-[#555] text-label hover:text-foreground transition-colors"
                >
                  {copied ? 'copied' : 'copy'}
                </button>
              </div>
            </div>

            {shareURL.length > 2048 && (
              <div className="mb-4 p-3 bg-[#1a1500] border border-[#332a00]">
                <p className="text-[10px] font-mono text-[#aa8800]">
                  URL exceeds 2048 chars — may not work in all browsers.
                </p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-[#1a0a0a] border border-[#3a1a1a]">
                <p className="text-[10px] font-mono text-[#cc4444]">{error}</p>
              </div>
            )}

            <div className="p-3 bg-[#0e0e0e] border border-[#1e1e1e] mb-4">
              <p className="text-[10px] font-mono text-dim leading-relaxed">
                Profile data is embedded in the URL. Recipient opens it directly in their browser.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-xs font-mono text-label border border-[#2a2a2a] hover:border-[#444] hover:text-foreground transition-colors"
              >
                close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
