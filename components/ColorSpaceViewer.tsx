'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Line, Html } from '@react-three/drei'
import * as THREE from 'three'
import type { ColorPoint } from '@/lib/icc-parser'

interface ColorSpaceViewerProps {
  colorPoints: ColorPoint[]
  profileName?: string
}

/**
 * 色空間の点を3Dで表示するコンポーネント
 */
function ColorPoints({ points }: { points: ColorPoint[] }) {
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
            />
          </mesh>

          {/* ラベル */}
          {point.label && (
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
 * 色域をワイヤーフレームで表示
 */
function ColorGamut({ points }: { points: ColorPoint[] }) {
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
          color="white"
          lineWidth={1.5}
          transparent
          opacity={0.6}
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
      <Line points={[[-0.5, 0, 0], [1.5, 0, 0]]} color="red" lineWidth={2} />
      <Html position={[1.6, 0, 0]}>
        <div style={{ color: 'red', fontSize: '12px' }}>X</div>
      </Html>

      {/* Y軸（緑） */}
      <Line points={[[0, -0.5, 0], [0, 1.5, 0]]} color="green" lineWidth={2} />
      <Html position={[0, 1.6, 0]}>
        <div style={{ color: 'green', fontSize: '12px' }}>Y</div>
      </Html>

      {/* Z軸（青） */}
      <Line points={[[0, 0, -0.5], [0, 0, 1.5]]} color="blue" lineWidth={2} />
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
function RotatingGroup({ children, autoRotate = false }: { children: React.ReactNode; autoRotate?: boolean }) {
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
export default function ColorSpaceViewer({ colorPoints, profileName }: ColorSpaceViewerProps) {
  return (
    <div className="w-full h-full relative">
      <Canvas>
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
          <ColorPoints points={colorPoints} />
          <ColorGamut points={colorPoints} />
          <AxisHelper />
        </RotatingGroup>

        {/* グリッド */}
        <gridHelper args={[2, 20, 0x444444, 0x222222]} />
      </Canvas>

      {/* プロファイル名の表示 */}
      {profileName && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded text-sm">
          {profileName}
        </div>
      )}

      {/* 操作説明 */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded text-xs">
        <div>🖱️ ドラッグ: 回転</div>
        <div>🔍 ホイール: ズーム</div>
      </div>
    </div>
  )
}
