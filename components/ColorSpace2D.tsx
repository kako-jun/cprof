'use client'

import { useMemo } from 'react'
import type { ColorPoint } from '@/lib/icc-parser'

interface ColorSpace2DProps {
  colorPoints: ColorPoint[]
  profileName?: string
  type: 'xy' | 'lab' | 'lch' | 'rgb-xy' | 'rgb-xz' | 'rgb-yz'
}

/**
 * CIE xy色度図のスペクトル軌跡（380nm-780nm）
 */
const SPECTRAL_LOCUS = [
  [0.1741, 0.005],
  [0.174, 0.005],
  [0.1738, 0.0049],
  [0.1736, 0.0049],
  [0.1733, 0.0048],
  [0.173, 0.0048],
  [0.1726, 0.0048],
  [0.1721, 0.0048],
  [0.1714, 0.0051],
  [0.1703, 0.0058],
  [0.1689, 0.0069],
  [0.1669, 0.0086],
  [0.1644, 0.0109],
  [0.1611, 0.0138],
  [0.1566, 0.0177],
  [0.151, 0.0227],
  [0.144, 0.0297],
  [0.1355, 0.0399],
  [0.1241, 0.0578],
  [0.1096, 0.0868],
  [0.0913, 0.1327],
  [0.0687, 0.2007],
  [0.0454, 0.295],
  [0.0235, 0.4127],
  [0.0082, 0.5384],
  [0.0039, 0.6548],
  [0.0139, 0.7502],
  [0.0389, 0.812],
  [0.0743, 0.8338],
  [0.1142, 0.8262],
  [0.1547, 0.8059],
  [0.1929, 0.7816],
  [0.2296, 0.7543],
  [0.2658, 0.7243],
  [0.3016, 0.6923],
  [0.3373, 0.6589],
  [0.3731, 0.6245],
  [0.4087, 0.5896],
  [0.4441, 0.5547],
  [0.4788, 0.5202],
  [0.5125, 0.4866],
  [0.5448, 0.4544],
  [0.5752, 0.4242],
  [0.6029, 0.3965],
  [0.627, 0.3725],
  [0.6482, 0.3514],
  [0.6658, 0.334],
  [0.6801, 0.3197],
  [0.6915, 0.3083],
  [0.7006, 0.2993],
  [0.7079, 0.292],
  [0.714, 0.2859],
  [0.719, 0.2809],
  [0.723, 0.277],
  [0.726, 0.274],
  [0.7283, 0.2717],
  [0.73, 0.27],
  [0.7311, 0.2689],
  [0.732, 0.268],
  [0.7327, 0.2673],
  [0.7334, 0.2666],
  [0.734, 0.266],
  [0.7344, 0.2656],
  [0.7346, 0.2654],
  [0.7347, 0.2653],
]

/**
 * XYZ色空間からsRGBへの変換
 */
function xyzToRgb(x: number, y: number, z: number): string {
  // XYZ to linear RGB (sRGB D65)
  let r = x * 3.2406 + y * -1.5372 + z * -0.4986
  let g = x * -0.9689 + y * 1.8758 + z * 0.0415
  let b = x * 0.0557 + y * -0.204 + z * 1.057

  // ガンマ補正
  const gamma = (c: number) => {
    if (c <= 0.0031308) return 12.92 * c
    return 1.055 * Math.pow(c, 1 / 2.4) - 0.055
  }

  r = gamma(r)
  g = gamma(g)
  b = gamma(b)

  // クランプ
  r = Math.max(0, Math.min(1, r))
  g = Math.max(0, Math.min(1, g))
  b = Math.max(0, Math.min(1, b))

  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`
}

/**
 * xy色度座標からRGBへの変換（Y=0.5と仮定）
 */
function xyToRgb(x: number, y: number): string {
  if (y === 0) return 'rgb(0, 0, 0)'
  const Y = 0.5
  const X = (Y / y) * x
  const Z = (Y / y) * (1 - x - y)
  return xyzToRgb(X, Y, Z)
}

/**
 * 点を中心からの角度でソート
 */
function sortPointsByAngle(points: { x: number; y: number; color?: string; label?: string }[]) {
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
 * 2D色空間ビューアー
 */
export default function ColorSpace2D({ colorPoints, profileName, type }: ColorSpace2DProps) {
  const { title, data, xLabel, yLabel, xRange, yRange } = useMemo(() => {
    switch (type) {
      case 'xy':
        return {
          title: 'CIE xy色度図',
          data: colorPoints.map((p) => ({
            x: p.x / (p.x + p.y + p.z) || 0,
            y: p.y / (p.x + p.y + p.z) || 0,
            color: p.color,
            label: p.label,
          })),
          xLabel: 'x',
          yLabel: 'y',
          xRange: [0, 0.8] as [number, number],
          yRange: [0, 0.9] as [number, number],
        }

      case 'lab':
        return {
          title: 'Lab a*b*平面',
          data: colorPoints.map((p) => ({
            // 簡易的なXYZからLabへの変換（実際はもっと複雑）
            x: (p.x - p.y) * 100,
            y: (p.y - p.z) * 100,
            color: p.color,
            label: p.label,
          })),
          xLabel: 'a*',
          yLabel: 'b*',
          xRange: [-100, 100] as [number, number],
          yRange: [-100, 100] as [number, number],
        }

      case 'lch':
        return {
          title: '色相環（LCh）',
          data: colorPoints.map((p) => {
            const a = (p.x - p.y) * 100
            const b = (p.y - p.z) * 100
            const c = Math.sqrt(a * a + b * b)
            const h = Math.atan2(b, a)
            return {
              x: c * Math.cos(h),
              y: c * Math.sin(h),
              color: p.color,
              label: p.label,
            }
          }),
          xLabel: 'C*cos(h)',
          yLabel: 'C*sin(h)',
          xRange: [-100, 100] as [number, number],
          yRange: [-100, 100] as [number, number],
        }

      case 'rgb-xy':
        return {
          title: 'RGB XY平面',
          data: colorPoints.map((p) => ({
            x: p.x,
            y: p.y,
            color: p.color,
            label: p.label,
          })),
          xLabel: 'X (R)',
          yLabel: 'Y (G)',
          xRange: [0, 1] as [number, number],
          yRange: [0, 1] as [number, number],
        }

      case 'rgb-xz':
        return {
          title: 'RGB XZ平面',
          data: colorPoints.map((p) => ({
            x: p.x,
            y: p.z,
            color: p.color,
            label: p.label,
          })),
          xLabel: 'X (R)',
          yLabel: 'Z (B)',
          xRange: [0, 1] as [number, number],
          yRange: [0, 1] as [number, number],
        }

      case 'rgb-yz':
        return {
          title: 'RGB YZ平面',
          data: colorPoints.map((p) => ({
            x: p.y,
            y: p.z,
            color: p.color,
            label: p.label,
          })),
          xLabel: 'Y (G)',
          yLabel: 'Z (B)',
          xRange: [0, 1] as [number, number],
          yRange: [0, 1] as [number, number],
        }

      default:
        return {
          title: '',
          data: [],
          xLabel: '',
          yLabel: '',
          xRange: [0, 1] as [number, number],
          yRange: [0, 1] as [number, number],
        }
    }
  }, [colorPoints, type])

  const width = 300
  const height = 300
  const padding = 40

  const scaleX = (x: number) => {
    return padding + ((x - xRange[0]) / (xRange[1] - xRange[0])) * (width - padding * 2)
  }

  const scaleY = (y: number) => {
    return height - padding - ((y - yRange[0]) / (yRange[1] - yRange[0])) * (height - padding * 2)
  }

  // xy色度図用のカラフルな背景を生成
  const colorGrid = useMemo(() => {
    if (type !== 'xy') return null

    const gridSize = 20
    const colors: React.ReactElement[] = []

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = xRange[0] + (i / gridSize) * (xRange[1] - xRange[0])
        const y = yRange[0] + (j / gridSize) * (yRange[1] - yRange[0])
        const color = xyToRgb(x, y)

        colors.push(
          <rect
            key={`${i}-${j}`}
            x={scaleX(x)}
            y={scaleY(y + (yRange[1] - yRange[0]) / gridSize)}
            width={(width - padding * 2) / gridSize}
            height={(height - padding * 2) / gridSize}
            fill={color}
            opacity={0.3}
          />
        )
      }
    }

    return colors
  }, [type, xRange, yRange, width, height, padding])

  // データポイントを角度でソート
  const sortedData = useMemo(() => {
    return sortPointsByAngle(data)
  }, [data])

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      <svg width={width} height={height} className="border border-gray-300 dark:border-gray-700">
        {/* 背景 */}
        <rect width={width} height={height} fill="black" />

        {/* xy色度図のカラフルな背景 */}
        {type === 'xy' && colorGrid}

        {/* xy色度図のスペクトル軌跡（馬蹄形） */}
        {type === 'xy' && (
          <>
            {/* スペクトル軌跡の塗りつぶし */}
            <polygon
              points={SPECTRAL_LOCUS.map(([x, y]) => `${scaleX(x)},${scaleY(y)}`).join(' ')}
              fill="none"
              stroke="gray"
              strokeWidth="1.5"
              strokeDasharray="3,3"
            />
            {/* 紫の線（スペクトルの両端を結ぶ） */}
            <line
              x1={scaleX(SPECTRAL_LOCUS[0][0])}
              y1={scaleY(SPECTRAL_LOCUS[0][1])}
              x2={scaleX(SPECTRAL_LOCUS[SPECTRAL_LOCUS.length - 1][0])}
              y2={scaleY(SPECTRAL_LOCUS[SPECTRAL_LOCUS.length - 1][1])}
              stroke="gray"
              strokeWidth="1.5"
              strokeDasharray="3,3"
            />
          </>
        )}

        {/* グリッド */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const x = scaleX(xRange[0] + tick * (xRange[1] - xRange[0]))
          const y = scaleY(yRange[0] + tick * (yRange[1] - yRange[0]))
          return (
            <g key={tick}>
              <line
                x1={x}
                y1={padding}
                x2={x}
                y2={height - padding}
                stroke="#333"
                strokeWidth="0.5"
              />
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#333"
                strokeWidth="0.5"
              />
            </g>
          )
        })}

        {/* 軸 */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="white"
          strokeWidth="2"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="white"
          strokeWidth="2"
        />

        {/* ラベル */}
        <text x={width / 2} y={height - 5} fill="white" fontSize="12" textAnchor="middle">
          {xLabel}
        </text>
        <text
          x={10}
          y={height / 2}
          fill="white"
          fontSize="12"
          textAnchor="middle"
          transform={`rotate(-90, 10, ${height / 2})`}
        >
          {yLabel}
        </text>

        {/* ポリゴン（色域の輪郭） - ソートされた点を使用 */}
        {sortedData.length > 0 && (
          <polygon
            points={sortedData.map((d) => `${scaleX(d.x)},${scaleY(d.y)}`).join(' ')}
            fill="none"
            stroke="cyan"
            strokeWidth="2"
          />
        )}

        {/* データポイント */}
        {sortedData.map((d, i) => (
          <g key={i}>
            <circle
              cx={scaleX(d.x)}
              cy={scaleY(d.y)}
              r="4"
              fill={d.color || 'white'}
              stroke="white"
              strokeWidth="1"
            />
            {d.label && (
              <text
                x={scaleX(d.x) + 8}
                y={scaleY(d.y) + 4}
                fill="white"
                fontSize="10"
                className="pointer-events-none"
              >
                {d.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}
