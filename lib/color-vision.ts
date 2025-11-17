/**
 * Color Vision Simulation
 *
 * 色覚シミュレーション（色盲・色弱）のための変換関数
 */

/**
 * 色覚タイプ
 */
export type ColorVisionType =
  | 'normal' // 正常色覚
  | 'protanopia' // 1型色覚（赤色盲）
  | 'deuteranopia' // 2型色覚（緑色盲）
  | 'tritanopia' // 3型色覚（青色盲）
  | 'protanomaly' // 1型2色覚（赤色弱）
  | 'deuteranomaly' // 2型2色覚（緑色弱）
  | 'tritanomaly' // 3型2色覚（青色弱）
  | 'achromatopsia' // 全色盲
  | 'achromatomaly' // 1色弱

/**
 * 色覚タイプの説明
 */
export const COLOR_VISION_DESCRIPTIONS: Record<ColorVisionType, string> = {
  normal: '正常色覚（3色型）',
  protanopia: '1型色覚（赤色盲・P型）',
  deuteranopia: '2型色覚（緑色盲・D型）',
  tritanopia: '3型色覚（青色盲・T型）',
  protanomaly: '1型2色覚（赤色弱）',
  deuteranomaly: '2型2色覚（緑色弱）',
  tritanomaly: '3型2色覚（青色弱）',
  achromatopsia: '全色盲（1色型）',
  achromatomaly: '1色弱',
}

/**
 * RGB値を持つオブジェクト
 */
interface RGB {
  r: number // 0-255
  g: number // 0-255
  b: number // 0-255
}

/**
 * LMS値（錐体応答）
 */
interface LMS {
  l: number // Long (赤)
  m: number // Medium (緑)
  s: number // Short (青)
}

/**
 * RGB → LMS 変換（Hunt-Pointer-Estevez変換）
 */
function rgbToLms(rgb: RGB): LMS {
  // 正規化 (0-1)
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  // sRGB → linear RGB
  const toLinear = (c: number) => {
    if (c <= 0.04045) return c / 12.92
    return Math.pow((c + 0.055) / 1.055, 2.4)
  }

  const lr = toLinear(r)
  const lg = toLinear(g)
  const lb = toLinear(b)

  // Linear RGB → LMS (Hunt-Pointer-Estevez matrix)
  const l = 0.31399022 * lr + 0.63951294 * lg + 0.04649755 * lb
  const m = 0.15537241 * lr + 0.75789446 * lg + 0.08670142 * lb
  const s = 0.01775239 * lr + 0.10944209 * lg + 0.87256922 * lb

  return { l, m, s }
}

/**
 * LMS → RGB 変換
 */
function lmsToRgb(lms: LMS): RGB {
  // LMS → Linear RGB (逆変換)
  const lr = 5.47221206 * lms.l - 4.6419601 * lms.m + 0.16963708 * lms.s
  const lg = -1.1252419 * lms.l + 2.29317094 * lms.m - 0.1678952 * lms.s
  const lb = 0.02980165 * lms.l - 0.19318073 * lms.m + 1.16364789 * lms.s

  // Linear RGB → sRGB
  const toSrgb = (c: number) => {
    if (c <= 0.0031308) return 12.92 * c
    return 1.055 * Math.pow(c, 1 / 2.4) - 0.055
  }

  const r = Math.max(0, Math.min(1, toSrgb(lr)))
  const g = Math.max(0, Math.min(1, toSrgb(lg)))
  const b = Math.max(0, Math.min(1, toSrgb(lb)))

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}

/**
 * 色覚シミュレーションを適用
 */
export function simulateColorVision(rgb: RGB, visionType: ColorVisionType): RGB {
  if (visionType === 'normal') return rgb

  const lms = rgbToLms(rgb)
  let simulated: LMS

  switch (visionType) {
    case 'protanopia': // 赤色盲（L錐体欠損）
      simulated = {
        l: 2.02344 * lms.m - 2.52581 * lms.s,
        m: lms.m,
        s: lms.s,
      }
      break

    case 'deuteranopia': // 緑色盲（M錐体欠損）
      simulated = {
        l: lms.l,
        m: 0.494207 * lms.l + 1.24827 * lms.s,
        s: lms.s,
      }
      break

    case 'tritanopia': // 青色盲（S錐体欠損）
      simulated = {
        l: lms.l,
        m: lms.m,
        s: -0.395913 * lms.l + 0.801109 * lms.m,
      }
      break

    case 'protanomaly': // 赤色弱（L錐体異常）
      simulated = {
        l: 0.817 * lms.l + 0.183 * lms.m,
        m: lms.m,
        s: lms.s,
      }
      break

    case 'deuteranomaly': // 緑色弱（M錐体異常）
      simulated = {
        l: lms.l,
        m: 0.494207 * lms.l + 0.505793 * lms.m,
        s: lms.s,
      }
      break

    case 'tritanomaly': // 青色弱（S錐体異常）
      simulated = {
        l: lms.l,
        m: lms.m,
        s: 0.05 * lms.l + 0.95 * lms.s,
      }
      break

    case 'achromatopsia': // 全色盲（モノクロ）
      const luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b
      return { r: luminance, g: luminance, b: luminance }

    case 'achromatomaly': // 1色弱（ほぼモノクロ）
      const lum = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b
      return {
        r: Math.round(rgb.r * 0.05 + lum * 0.95),
        g: Math.round(rgb.g * 0.05 + lum * 0.95),
        b: Math.round(rgb.b * 0.05 + lum * 0.95),
      }

    default:
      return rgb
  }

  return lmsToRgb(simulated)
}

/**
 * RGB文字列（"rgb(r, g, b)"）から RGB オブジェクトへ変換
 */
export function parseRgbString(rgbString: string): RGB {
  const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (!match) {
    return { r: 0, g: 0, b: 0 }
  }

  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10),
  }
}

/**
 * RGB オブジェクトから RGB文字列へ変換
 */
export function rgbToString(rgb: RGB): string {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
}

/**
 * 16進数カラーコードをRGBに変換
 */
export function hexToRgb(hex: string): RGB {
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
 * RGBを16進数カラーコードに変換
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const hex = n.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
}
