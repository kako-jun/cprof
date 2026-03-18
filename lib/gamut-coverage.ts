/**
 * Gamut Coverage Calculator
 *
 * 色域カバレッジを計算し、異なる色空間間の比較を行う
 */

import type { ColorPoint } from './icc-parser'

/**
 * 2Dポリゴンの面積を計算（Shoelace formula）
 */
function calculatePolygonArea(points: { x: number; y: number }[]): number {
  if (points.length < 3) return 0

  let area = 0
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length
    area += points[i].x * points[j].y
    area -= points[j].x * points[i].y
  }
  return Math.abs(area) / 2
}

/**
 * ColorPointをxy色度座標に変換
 */
function toXYChromaticity(point: ColorPoint): { x: number; y: number } {
  const sum = point.x + point.y + point.z
  if (sum === 0) return { x: 0, y: 0 }
  return {
    x: point.x / sum,
    y: point.y / sum,
  }
}

/**
 * 点を中心からの角度でソート（凸包を形成）
 */
function sortPointsByAngle(points: { x: number; y: number }[]): { x: number; y: number }[] {
  if (points.length === 0) return points

  // 中心点を計算
  const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length
  const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length

  // 角度でソート
  return [...points].sort((a, b) => {
    const angleA = Math.atan2(a.y - centerY, a.x - centerX)
    const angleB = Math.atan2(b.y - centerY, b.x - centerX)
    return angleA - angleB
  })
}

/**
 * xy色度図上での色域面積を計算
 */
export function calculateGamutArea(colorPoints: ColorPoint[]): number {
  // プライマリカラーのみを使用（R, G, B）
  const primaries = colorPoints.slice(0, 3)
  const xyPoints = primaries.map(toXYChromaticity)
  const sortedPoints = sortPointsByAngle(xyPoints)
  return calculatePolygonArea(sortedPoints)
}

/**
 * Sutherland-Hodgman アルゴリズムによるポリゴンクリッピング
 *
 * subjectPolygon を clipPolygon で切り取った交差領域を返す
 */
function sutherlandHodgmanClip(
  subjectPolygon: { x: number; y: number }[],
  clipPolygon: { x: number; y: number }[]
): { x: number; y: number }[] {
  if (subjectPolygon.length < 3 || clipPolygon.length < 3) return []

  let output = [...subjectPolygon]

  for (let i = 0; i < clipPolygon.length; i++) {
    if (output.length === 0) return []

    const input = [...output]
    output = []

    const edgeStart = clipPolygon[i]
    const edgeEnd = clipPolygon[(i + 1) % clipPolygon.length]

    for (let j = 0; j < input.length; j++) {
      const current = input[j]
      const previous = input[(j + input.length - 1) % input.length]

      const currInside = isInsideEdge(current, edgeStart, edgeEnd)
      const prevInside = isInsideEdge(previous, edgeStart, edgeEnd)

      if (currInside) {
        if (!prevInside) {
          const intersection = lineIntersection(previous, current, edgeStart, edgeEnd)
          if (intersection) output.push(intersection)
        }
        output.push(current)
      } else if (prevInside) {
        const intersection = lineIntersection(previous, current, edgeStart, edgeEnd)
        if (intersection) output.push(intersection)
      }
    }
  }

  return output
}

/**
 * 点がエッジの内側（左側）にあるかを判定
 */
function isInsideEdge(
  point: { x: number; y: number },
  edgeStart: { x: number; y: number },
  edgeEnd: { x: number; y: number }
): boolean {
  return (
    (edgeEnd.x - edgeStart.x) * (point.y - edgeStart.y) -
    (edgeEnd.y - edgeStart.y) * (point.x - edgeStart.x) >= 0
  )
}

/**
 * 2つの線分の交点を計算
 */
function lineIntersection(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  p4: { x: number; y: number }
): { x: number; y: number } | null {
  const denom =
    (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x)

  if (Math.abs(denom) < 1e-12) return null

  const t =
    ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom

  return {
    x: p1.x + t * (p2.x - p1.x),
    y: p1.y + t * (p2.y - p1.y),
  }
}

/**
 * 2つの色域の重なり面積を計算（Sutherland-Hodgman アルゴリズム）
 */
export function calculateGamutOverlap(
  colorPoints1: ColorPoint[],
  colorPoints2: ColorPoint[]
): number {
  const poly1 = getGamutTriangle(colorPoints1)
  const poly2 = getGamutTriangle(colorPoints2)

  const intersection = sutherlandHodgmanClip(poly1, poly2)
  const intersectionArea = calculatePolygonArea(intersection)

  const area1 = calculatePolygonArea(poly1)
  const area2 = calculatePolygonArea(poly2)
  const unionArea = area1 + area2 - intersectionArea

  if (unionArea === 0) return 0
  return intersectionArea / unionArea
}

/**
 * ColorPoint配列からxy色度図上の三角形（RGB三原色）を取得
 */
function getGamutTriangle(colorPoints: ColorPoint[]): { x: number; y: number }[] {
  const primaries = colorPoints.slice(0, 3)
  const xyPoints = primaries.map(toXYChromaticity)
  return sortPointsByAngle(xyPoints)
}

/**
 * 色域カバレッジを計算（パーセンテージ）
 *
 * ターゲット色域がリファレンス色域をどの程度カバーしているかを、
 * xy色度図上のポリゴン交差面積で正確に計算する。
 *
 * @param target カバレッジを計算したい色域
 * @param reference 基準となる色域
 * @returns カバレッジのパーセンテージ (0-100+)
 */
export function calculateCoverage(target: ColorPoint[], reference: ColorPoint[]): number {
  const targetPoly = getGamutTriangle(target)
  const refPoly = getGamutTriangle(reference)

  const referenceArea = calculatePolygonArea(refPoly)
  if (referenceArea === 0) return 0

  // ターゲットとリファレンスの交差領域を計算
  const intersection = sutherlandHodgmanClip(targetPoly, refPoly)
  const intersectionArea = calculatePolygonArea(intersection)

  // カバレッジ = 交差面積 / リファレンス面積 * 100
  // 100%以下: ターゲットがリファレンスを完全にはカバーしていない
  // 100%: ターゲットがリファレンスを完全にカバー
  return (intersectionArea / referenceArea) * 100
}

/**
 * 2つの色域の差分面積を計算
 */
export function calculateGamutDifference(
  colorPoints1: ColorPoint[],
  colorPoints2: ColorPoint[]
): {
  area1: number
  area2: number
  ratio: number
  difference: number
} {
  const area1 = calculateGamutArea(colorPoints1)
  const area2 = calculateGamutArea(colorPoints2)

  return {
    area1,
    area2,
    ratio: area2 !== 0 ? area1 / area2 : 0,
    difference: Math.abs(area1 - area2),
  }
}

/**
 * 色域の中心点を計算
 */
export function calculateGamutCenter(colorPoints: ColorPoint[]): {
  x: number
  y: number
  z: number
} {
  if (colorPoints.length === 0) {
    return { x: 0, y: 0, z: 0 }
  }

  const sum = colorPoints.reduce(
    (acc, p) => ({
      x: acc.x + p.x,
      y: acc.y + p.y,
      z: acc.z + p.z,
    }),
    { x: 0, y: 0, z: 0 }
  )

  return {
    x: sum.x / colorPoints.length,
    y: sum.y / colorPoints.length,
    z: sum.z / colorPoints.length,
  }
}

/**
 * 標準色空間のプリセット定義
 */
export const STANDARD_COLOR_SPACES = {
  sRGB: {
    name: 'sRGB',
    description: 'Standard RGB (Web標準)',
    points: [
      { x: 0.4124, y: 0.2126, z: 0.0193, label: 'Red', color: '#ff0000' },
      { x: 0.3576, y: 0.7152, z: 0.1192, label: 'Green', color: '#00ff00' },
      { x: 0.1805, y: 0.0722, z: 0.9505, label: 'Blue', color: '#0000ff' },
    ] as ColorPoint[],
  },
  AdobeRGB: {
    name: 'Adobe RGB (1998)',
    description: '広色域（印刷向け）',
    points: [
      { x: 0.5767, y: 0.2973, z: 0.027, label: 'Red', color: '#ff0000' },
      { x: 0.2973, y: 0.6274, z: 0.0753, label: 'Green', color: '#00ff00' },
      { x: 0.027, y: 0.0753, z: 0.9911, label: 'Blue', color: '#0000ff' },
    ] as ColorPoint[],
  },
  DisplayP3: {
    name: 'Display P3',
    description: 'DCI-P3 (Apple/映画産業)',
    points: [
      { x: 0.5151, y: 0.2412, z: -0.0011, label: 'Red', color: '#ff0000' },
      { x: 0.292, y: 0.6922, z: 0.0419, label: 'Green', color: '#00ff00' },
      { x: 0.1571, y: 0.0666, z: 0.7841, label: 'Blue', color: '#0000ff' },
    ] as ColorPoint[],
  },
  Rec2020: {
    name: 'Rec. 2020',
    description: 'ITU-R BT.2020 (4K/8K/HDR)',
    points: [
      { x: 0.637, y: 0.33, z: 0.03, label: 'Red', color: '#ff0000' },
      { x: 0.265, y: 0.69, z: 0.045, label: 'Green', color: '#00ff00' },
      { x: 0.15, y: 0.06, z: 1.06, label: 'Blue', color: '#0000ff' },
    ] as ColorPoint[],
  },
  ProPhotoRGB: {
    name: 'ProPhoto RGB',
    description: '超広色域（RAW現像向け）',
    points: [
      { x: 0.7347, y: 0.2653, z: 0.0, label: 'Red', color: '#ff0000' },
      { x: 0.1596, y: 0.8404, z: 0.0, label: 'Green', color: '#00ff00' },
      { x: 0.0366, y: 0.0001, z: 0.9633, label: 'Blue', color: '#0000ff' },
    ] as ColorPoint[],
  },
} as const

/**
 * 複数の標準色空間に対するカバレッジを一括計算
 */
export function calculateStandardCoverages(colorPoints: ColorPoint[]): {
  [key: string]: number
} {
  const result: { [key: string]: number } = {}

  for (const [key, standard] of Object.entries(STANDARD_COLOR_SPACES)) {
    result[key] = calculateCoverage(colorPoints, standard.points)
  }

  return result
}
