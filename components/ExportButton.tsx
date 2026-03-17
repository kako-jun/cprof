'use client'

import { useState } from 'react'
import type { ICCProfile } from '@/lib/icc-parser'
import { exportProfile, type ExportFormat } from '@/lib/data-export'

interface ExportButtonProps {
  profile: ICCProfile
  profileName?: string
}

export default function ExportButton({ profile, profileName }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json')

  const formats: { value: ExportFormat; label: string; description: string }[] = [
    { value: 'json', label: 'JSON', description: 'structured data for programmatic use' },
    { value: 'csv', label: 'CSV', description: 'tabular format for spreadsheets' },
    { value: 'xyz', label: 'XYZ point cloud', description: 'for 3D tools (Blender etc.)' },
    { value: 'summary', label: 'text report', description: 'human-readable summary' },
  ]

  const handleExport = () => {
    try {
      exportProfile(profile, selectedFormat, profileName)
      setIsOpen(false)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed')
    }
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="px-2 py-1.5 text-xs font-mono text-label border border-[#2e2e2e] hover:border-[#444] hover:text-foreground transition-colors w-full"
      >
        export
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
          <div className="bg-[#111] border border-[#2a2a2a] p-6 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-mono text-foreground uppercase tracking-widest">Export Data</p>
              <button
                onClick={() => setIsOpen(false)}
                className="text-dim hover:text-foreground font-mono text-sm transition-colors"
              >
                x
              </button>
            </div>

            {profileName && (
              <p className="text-xs font-mono text-label mb-4">{profileName}</p>
            )}

            <div className="mb-5">
              <p className="text-[10px] font-mono text-dim uppercase tracking-widest mb-3">format</p>
              <div className="space-y-1">
                {formats.map((format) => (
                  <label
                    key={format.value}
                    className={`flex items-start p-2.5 cursor-pointer border transition-colors ${
                      selectedFormat === format.value
                        ? 'border-[#444] bg-[#1a1a1a]'
                        : 'border-[#1e1e1e] hover:border-[#2e2e2e]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="export-format"
                      value={format.value}
                      checked={selectedFormat === format.value}
                      onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                      className="mt-0.5 mr-3 accent-[#666]"
                    />
                    <div>
                      <p className="text-xs font-mono text-foreground">{format.label}</p>
                      <p className="text-[10px] font-mono text-dim mt-0.5">{format.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-3 bg-[#0e0e0e] border border-[#1e1e1e] mb-4">
              <p className="text-[10px] font-mono text-dim leading-relaxed">
                JSON: tool integration &nbsp;|&nbsp; CSV: analysis &nbsp;|&nbsp; XYZ: 3D viz
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs font-mono text-label border border-[#2a2a2a] hover:border-[#444] hover:text-foreground transition-colors"
              >
                cancel
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 text-xs font-mono text-foreground border border-[#3a3a3a] hover:border-[#666] transition-colors"
              >
                download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
