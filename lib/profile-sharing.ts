/**
 * Profile Sharing Utilities
 *
 * プロファイルをURLパラメータとして共有するためのユーティリティ
 */

import type { ICCProfile } from './icc-parser'

/**
 * ArrayBufferをBase64文字列にエンコード
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Base64文字列をArrayBufferにデコード
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

/**
 * FileオブジェクトをBase64にエンコード
 */
export async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  return arrayBufferToBase64(buffer)
}

/**
 * Base64からFileオブジェクトを復元
 */
export function base64ToFile(base64: string, filename: string): File {
  const buffer = base64ToArrayBuffer(base64)
  return new File([buffer], filename, { type: 'application/octet-stream' })
}

/**
 * プロファイル情報を含むURLを生成
 */
export function createProfileURL(
  file: File,
  base64Data: string,
  baseURL: string = window.location.origin
): string {
  const params = new URLSearchParams()
  params.set('profile', base64Data)
  params.set('name', file.name)
  return `${baseURL}?${params.toString()}`
}

/**
 * URLからプロファイル情報を抽出
 */
export function extractProfileFromURL(): {
  profile: string | null
  name: string | null
} {
  if (typeof window === 'undefined') {
    return { profile: null, name: null }
  }

  const params = new URLSearchParams(window.location.search)
  return {
    profile: params.get('profile'),
    name: params.get('name'),
  }
}

/**
 * プロファイルの共有リンクを生成
 */
export async function generateShareLink(file: File): Promise<string> {
  try {
    const base64 = await fileToBase64(file)

    // URLが長すぎる場合は警告
    if (base64.length > 2048) {
      console.warn('Profile data is large, URL might be too long for some browsers')
    }

    return createProfileURL(file, base64)
  } catch (error) {
    console.error('Failed to generate share link:', error)
    throw new Error('共有リンクの生成に失敗しました')
  }
}

/**
 * QRコード用のデータURLを生成（外部ライブラリ不要版）
 *
 * 注: 実際のQRコード生成には qrcode パッケージなどが必要
 * ここでは簡易版としてテキストのみ返す
 */
export function generateQRCodeData(url: string): string {
  // 実際の実装では qrcode.react や qrcode などを使用
  return url
}

/**
 * クリップボードにURLをコピー
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)

    // フォールバック: 古いブラウザ向け
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      const success = document.execCommand('copy')
      document.body.removeChild(textArea)
      return success
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError)
      return false
    }
  }
}

/**
 * プロファイルデータの圧縮（簡易版）
 *
 * 注: より効率的な圧縮には pako などの圧縮ライブラリが必要
 */
export function compressProfileData(base64: string): string {
  // TODO: 実際の圧縮実装
  // 現状はそのまま返す
  return base64
}

/**
 * プロファイルデータの展開（簡易版）
 */
export function decompressProfileData(compressed: string): string {
  // TODO: 実際の展開実装
  // 現状はそのまま返す
  return compressed
}
