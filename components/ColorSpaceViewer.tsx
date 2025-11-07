'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Line, Html } from '@react-three/drei'
import * as THREE from 'three'
import type { ColorPoint } from '@/lib/icc-parser'

interface ColorSpaceViewerProps {
  colorPoints: ColorPoint[]
  profileName?: string
  colorPoints2?: ColorPoint[]
  profileName2?: string
  gradientMode?: boolean
}

/**
 * 色空間の点を3Dで表示するコンポーネント
 */
function ColorPoints({
  points,
  opacity = 1,
  showLabels = true,
}: {
  points: ColorPoint[]
  opacity?: number
  showLabels?: boolean
}) {
  return (
    <>
      {points.map((point, index) => (
        <group key={index} position={[point.x, point.y, point.z]}>
          {/* 点 */}
          <mesh>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshStandardMaterial
              color={point.color || '#ffffff'}
              emissive={point.color || '#ffffff'}
              emissiveIntensity={0.5}
              transparent={opacity < 1}
              opacity={opacity}
            />
          </mesh>

          {/* ラベル */}
          {point.label && showLabels && (
            <Html distanceFactor={2}>
              <div
                style={{
                  color: 'white',
                  fontSize: '10px',
                  padding: '2px 4px',
                  background: 'rgba(0,0,0,0.5)',
                  borderRadius: '3px',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  opacity: opacity,
                }}
              >
                {point.label}
              </div>
            </Html>
          )}
        </group>
      ))}
    </>
  )
}

/**
 * グラデーション着色された色立体を表示
 */
function ColorGamutSolid({ points, opacity = 0.8 }: { points: ColorPoint[]; opacity?: number }) {
  if (points.length < 8) return null

  const red = points[0]
  const green = points[1]
  const blue = points[2]
  const black = points[7]

  // RGB色空間を表現する三角錐のジオメトリを作成
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()

    // 頂点座標
    const vertices = new Float32Array([
      // 三角錐の底面（黒）
      black.x,
      black.y,
      black.z,

      // 三角錐の頂点（R, G, B）
      red.x,
      red.y,
      red.z,
      green.x,
      green.y,
      green.z,
      blue.x,
      blue.y,
      blue.z,
    ])

    // 三角形の面を定義
    const indices = new Uint16Array([
      // 底面から各頂点への3つの面
      0,
      1,
      2, // 黒 -> 赤 -> 緑
      0,
      2,
      3, // 黒 -> 緑 -> 青
      0,
      3,
      1, // 黒 -> 青 -> 赤
      // 上面（RGB三角形）
      1,
      3,
      2, // 赤 -> 青 -> 緑
    ])

    // 頂点カラー（各頂点の色）
    const colors = new Float32Array([
      // 黒
      0, 0, 0,
      // 赤
      1, 0, 0,
      // 緑
      0, 1, 0,
      // 青
      0, 0, 1,
    ])

    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.setIndex(new THREE.BufferAttribute(indices, 1))
    geo.computeVertexNormals()

    return geo
  }, [red, green, blue, black])

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        vertexColors
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        emissive={new THREE.Color(0x111111)}
        emissiveIntensity={0.3}
      />
    </mesh>
  )
}

/**
 * 色域をワイヤーフレームで表示
 */
function ColorGamut({
  points,
  color = 'white',
  opacity = 0.6,
}: {
  points: ColorPoint[]
  color?: string
  opacity?: number
}) {
  // RGB色空間の場合、三角柱として表示
  // points[0-2]: R, G, B
  // points[3-5]: Y, C, M
  // points[6-7]: W, K

  if (points.length < 8) return null

  const red = points[0]
  const green = points[1]
  const blue = points[2]
  const yellow = points[3]
  const cyan = points[4]
  const magenta = points[5]
  const white = points[6]
  const black = points[7]

  // 三角形の辺を描画
  const edges = useMemo(() => {
    return [
      // 上面（最大輝度）の三角形
      [
        [red.x, red.y, red.z],
        [green.x, green.y, green.z],
      ],
      [
        [green.x, green.y, green.z],
        [blue.x, blue.y, blue.z],
      ],
      [
        [blue.x, blue.y, blue.z],
        [red.x, red.y, red.z],
      ],

      // 下面（ブラック）への接続
      [
        [red.x, red.y, red.z],
        [black.x, black.y, black.z],
      ],
      [
        [green.x, green.y, green.z],
        [black.x, black.y, black.z],
      ],
      [
        [blue.x, blue.y, blue.z],
        [black.x, black.y, black.z],
      ],

      // 二次色への接続
      [
        [red.x, red.y, red.z],
        [yellow.x, yellow.y, yellow.z],
      ],
      [
        [green.x, green.y, green.z],
        [yellow.x, yellow.y, yellow.z],
      ],
      [
        [green.x, green.y, green.z],
        [cyan.x, cyan.y, cyan.z],
      ],
      [
        [blue.x, blue.y, blue.z],
        [cyan.x, cyan.y, cyan.z],
      ],
      [
        [blue.x, blue.y, blue.z],
        [magenta.x, magenta.y, magenta.z],
      ],
      [
        [red.x, red.y, red.z],
        [magenta.x, magenta.y, magenta.z],
      ],
    ]
  }, [red, green, blue, yellow, cyan, magenta, white, black])

  return (
    <>
      {edges.map((edge, i) => (
        <Line
          key={i}
          points={edge.map((p) => new THREE.Vector3(p[0], p[1], p[2]))}
          color={color}
          lineWidth={1.5}
          transparent
          opacity={opacity}
        />
      ))}
    </>
  )
}

/**
 * XYZ軸を表示
 */
function AxisHelper() {
  return (
    <group>
      {/* X軸（赤） */}
      <Line
        points={[
          [-0.5, 0, 0],
          [1.5, 0, 0],
        ]}
        color="red"
        lineWidth={2}
      />
      <Html position={[1.6, 0, 0]}>
        <div style={{ color: 'red', fontSize: '12px' }}>X</div>
      </Html>

      {/* Y軸（緑） */}
      <Line
        points={[
          [0, -0.5, 0],
          [0, 1.5, 0],
        ]}
        color="green"
        lineWidth={2}
      />
      <Html position={[0, 1.6, 0]}>
        <div style={{ color: 'green', fontSize: '12px' }}>Y</div>
      </Html>

      {/* Z軸（青） */}
      <Line
        points={[
          [0, 0, -0.5],
          [0, 0, 1.5],
        ]}
        color="blue"
        lineWidth={2}
      />
      <Html position={[0, 0, 1.6]}>
        <div style={{ color: 'blue', fontSize: '12px' }}>Z</div>
      </Html>

      {/* 原点 */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshBasicMaterial color="white" />
      </mesh>
    </group>
  )
}

/**
 * 回転アニメーション（オプション）
 */
function RotatingGroup({
  children,
  autoRotate = false,
}: {
  children: React.ReactNode
  autoRotate?: boolean
}) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2
    }
  })

  return <group ref={groupRef}>{children}</group>
}

/**
 * メインの3Dビューアコンポーネント
 */
export default function ColorSpaceViewer({
  colorPoints,
  profileName,
  colorPoints2,
  profileName2,
  gradientMode = false,
}: ColorSpaceViewerProps) {
  const compareMode = !!colorPoints2

  const handleScreenshot = () => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return

    // canvasをPNG画像として保存
    canvas.toBlob((blob) => {
      if (!blob) return

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const filename = `cprof-${profileName?.replace(/[^a-z0-9]/gi, '_') || 'screenshot'}-${Date.now()}.png`
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    })
  }

  return (
    <div className="w-full h-full relative">
      <Canvas gl={{ preserveDrawingBuffer: true }}>
        <PerspectiveCamera makeDefault position={[2, 1.5, 2]} fov={50} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          minDistance={1}
          maxDistance={5}
        />

        {/* 照明 */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        {/* 色空間の表示 */}
        <RotatingGroup autoRotate={false}>
          {/* プロファイル1 */}
          <ColorPoints
            points={colorPoints}
            opacity={compareMode ? 0.8 : 1}
            showLabels={!compareMode}
          />

          {gradientMode ? (
            <ColorGamutSolid points={colorPoints} opacity={compareMode ? 0.6 : 0.8} />
          ) : (
            <ColorGamut points={colorPoints} color="white" opacity={compareMode ? 0.4 : 0.6} />
          )}

          {/* プロファイル2（比較モード） */}
          {colorPoints2 && (
            <>
              <ColorPoints points={colorPoints2} opacity={0.8} showLabels={false} />
              {gradientMode ? (
                <ColorGamutSolid points={colorPoints2} opacity={0.5} />
              ) : (
                <ColorGamut points={colorPoints2} color="cyan" opacity={0.4} />
              )}
            </>
          )}

          <AxisHelper />
        </RotatingGroup>

        {/* グリッド */}
        <gridHelper args={[2, 20, 0x444444, 0x222222]} />
      </Canvas>

      {/* プロファイル名の表示 */}
      {profileName && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded text-sm space-y-1">
          <div>📊 {profileName}</div>
          {profileName2 && compareMode && <div className="text-cyan-300">📊 {profileName2}</div>}
        </div>
      )}

      {/* 比較モード表示 */}
      {compareMode && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded text-xs">
          <div className="font-semibold mb-1">比較モード</div>
          <div>白: プロファイル1</div>
          <div className="text-cyan-300">シアン: プロファイル2</div>
        </div>
      )}

      {/* 操作説明とスクリーンショットボタン */}
      <div className="absolute bottom-4 right-4 space-y-2">
        <div className="bg-black bg-opacity-50 text-white px-3 py-2 rounded text-xs">
          <div>🖱️ ドラッグ: 回転</div>
          <div>🔍 ホイール: ズーム</div>
        </div>
        <button
          onClick={handleScreenshot}
          className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs transition-colors flex items-center justify-center gap-2"
        >
          📸 スクリーンショット
        </button>
      </div>
    </div>
  )
}
