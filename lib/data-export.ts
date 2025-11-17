/**
 * Data Export Utilities
 *
 * プロファイルデータのエクスポート機能
 */

import type { ICCProfile, ColorPoint } from './icc-parser'
import { calculateStandardCoverages, calculateGamutArea } from './gamut-coverage'

/**
 * エクスポート形式
 */
export type ExportFormat = 'json' | 'csv' | 'xyz' | 'summary'

/**
 * プロファイルデータをJSON形式でエクスポート
 */
export function exportAsJSON(profile: ICCProfile): string {
  const coverages = calculateStandardCoverages(profile.colorPoints)
  const gamutArea = calculateGamutArea(profile.colorPoints)

  const data = {
    metadata: {
      description: profile.description,
      version: profile.header.version,
      colorSpace: profile.header.colorSpace,
      deviceClass: profile.header.deviceClass,
      pcs: profile.header.pcs,
      manufacturer: profile.header.manufacturer,
      model: profile.header.model,
      exportDate: new Date().toISOString(),
    },
    gamut: {
      volume: profile.gamutVolume,
      area: gamutArea,
      coverages,
    },
    colorPoints: profile.colorPoints.map((p) => ({
      x: p.x,
      y: p.y,
      z: p.z,
      label: p.label,
      color: p.color,
      chromaticity: {
        x: p.x / (p.x + p.y + p.z),
        y: p.y / (p.x + p.y + p.z),
      },
    })),
  }

  return JSON.stringify(data, null, 2)
}

/**
 * プロファイルデータをCSV形式でエクスポート
 */
export function exportAsCSV(profile: ICCProfile): string {
  const lines: string[] = []

  // ヘッダー
  lines.push('Label,X,Y,Z,Chromaticity_x,Chromaticity_y,Color')

  // データ行
  profile.colorPoints.forEach((p) => {
    const sum = p.x + p.y + p.z
    const cx = sum > 0 ? p.x / sum : 0
    const cy = sum > 0 ? p.y / sum : 0

    lines.push(
      `${p.label || ''},${p.x},${p.y},${p.z},${cx.toFixed(6)},${cy.toFixed(6)},${p.color || ''}`
    )
  })

  return lines.join('\n')
}

/**
 * XYZ点群データとしてエクスポート（3D可視化ツール用）
 */
export function exportAsXYZ(profile: ICCProfile): string {
  const lines: string[] = []

  // XYZフォーマット: X Y Z [R G B]
  profile.colorPoints.forEach((p) => {
    let line = `${p.x.toFixed(6)} ${p.y.toFixed(6)} ${p.z.toFixed(6)}`

    // オプション: RGB値を追加
    if (p.color) {
      const rgb = hexToRgb(p.color)
      line += ` ${rgb.r} ${rgb.g} ${rgb.b}`
    }

    lines.push(line)
  })

  return lines.join('\n')
}

/**
 * サマリーレポートをテキスト形式でエクスポート
 */
export function exportAsSummary(profile: ICCProfile): string {
  const coverages = calculateStandardCoverages(profile.colorPoints)
  const gamutArea = calculateGamutArea(profile.colorPoints)

  const lines: string[] = []

  lines.push('='.repeat(60))
  lines.push('ICC Profile Analysis Report')
  lines.push('='.repeat(60))
  lines.push('')

  lines.push('Profile Information')
  lines.push('-'.repeat(60))
  lines.push(`Description: ${profile.description || 'N/A'}`)
  lines.push(`Version: ${profile.header.version}`)
  lines.push(`Color Space: ${profile.header.colorSpace}`)
  lines.push(`Device Class: ${profile.header.deviceClass}`)
  lines.push(`PCS: ${profile.header.pcs}`)
  lines.push(`Manufacturer: ${profile.header.manufacturer || 'N/A'}`)
  lines.push(`Model: ${profile.header.model || 'N/A'}`)
  lines.push('')

  lines.push('Gamut Metrics')
  lines.push('-'.repeat(60))
  lines.push(`3D Gamut Volume: ${profile.gamutVolume?.toFixed(6) || 'N/A'}`)
  lines.push(`2D Chromaticity Area: ${gamutArea.toFixed(6)}`)
  lines.push('')

  lines.push('Coverage Comparison (% of standard color space)')
  lines.push('-'.repeat(60))
  Object.entries(coverages).forEach(([key, coverage]) => {
    const bar = '█'.repeat(Math.round(coverage / 5))
    lines.push(`${key.padEnd(15)}: ${coverage.toFixed(1).padStart(6)}% ${bar}`)
  })
  lines.push('')

  lines.push('Primary Colors (XYZ)')
  lines.push('-'.repeat(60))
  profile.colorPoints.slice(0, 3).forEach((p) => {
    const sum = p.x + p.y + p.z
    const cx = sum > 0 ? p.x / sum : 0
    const cy = sum > 0 ? p.y / sum : 0
    lines.push(
      `${(p.label || 'Unknown').padEnd(10)}: X=${p.x.toFixed(4)} Y=${p.y.toFixed(4)} Z=${p.z.toFixed(4)} (x=${cx.toFixed(4)}, y=${cy.toFixed(4)})`
    )
  })
  lines.push('')

  lines.push(`Report generated: ${new Date().toLocaleString()}`)
  lines.push('='.repeat(60))

  return lines.join('\n')
}

/**
 * 16進数カラーコードをRGBに変換（簡易版）
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) {
    return { r: 0, g: 0, b: 0 }
  }

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

/**
 * ファイルとしてダウンロード
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()

  // クリーンアップ
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * プロファイルデータをエクスポート
 */
export function exportProfile(profile: ICCProfile, format: ExportFormat, baseName?: string) {
  const name = baseName || profile.description || 'profile'
  const safeName = name.replace(/[^a-zA-Z0-9-_]/g, '_')

  let content: string
  let filename: string
  let mimeType: string

  switch (format) {
    case 'json':
      content = exportAsJSON(profile)
      filename = `${safeName}.json`
      mimeType = 'application/json'
      break

    case 'csv':
      content = exportAsCSV(profile)
      filename = `${safeName}.csv`
      mimeType = 'text/csv'
      break

    case 'xyz':
      content = exportAsXYZ(profile)
      filename = `${safeName}.xyz`
      mimeType = 'text/plain'
      break

    case 'summary':
      content = exportAsSummary(profile)
      filename = `${safeName}_report.txt`
      mimeType = 'text/plain'
      break

    default:
      throw new Error(`Unsupported export format: ${format}`)
  }

  downloadFile(content, filename, mimeType)
}
