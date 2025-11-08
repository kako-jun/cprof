'use client'

import { useMemo } from 'react'
import type { ColorPoint } from '@/lib/icc-parser'

interface ColorSpace2DProps {
  colorPoints: ColorPoint[]
  profileName?: string
  type: 'xy' | 'lab' | 'lch' | 'rgb-xy' | 'rgb-xz' | 'rgb-yz'
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

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      <svg width={width} height={height} className="border border-gray-300 dark:border-gray-700">
        {/* 背景 */}
        <rect width={width} height={height} fill="black" />

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

        {/* ポリゴン（色域の輪郭） */}
        {data.length > 0 && (
          <polygon
            points={data.map((d) => `${scaleX(d.x)},${scaleY(d.y)}`).join(' ')}
            fill="none"
            stroke="cyan"
            strokeWidth="2"
          />
        )}

        {/* データポイント */}
        {data.map((d, i) => (
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
