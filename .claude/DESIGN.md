# cprof - 設計ドキュメント

## 設計哲学

### コア原則

1. **シンプルさ優先**
   - 依存パッケージを最小限に
   - 過度な抽象化を避ける
   - コードは読みやすさ重視

2. **型安全性**
   - TypeScriptを活用
   - 実行時エラーを防ぐ
   - IDEの補完を最大化

3. **パフォーマンス**
   - 不要な再計算を避ける
   - メモ化を活用
   - 遅延ロードを実装

4. **ユーザー第一**
   - 直感的なUI/UX
   - エラーメッセージは明確に
   - プライバシーを保護

## データモデル

### 型定義

#### ICCProfile

```typescript
interface ICCProfile {
  header: ICCProfileHeader // プロファイルメタデータ
  colorPoints: ColorPoint[] // 色空間の点
  gamutVolume?: number // 3D色域体積
  description?: string // プロファイル説明
}
```

#### ColorPoint

```typescript
interface ColorPoint {
  x: number // XYZ色空間のX座標
  y: number // XYZ色空間のY座標
  z: number // XYZ色空間のZ座標
  label?: string // ラベル（"Red", "Green"など）
  color?: string // 16進数カラーコード（"#ff0000"）
}
```

### データ変換フロー

```
ICC Binary File
    ↓ parseICCProfile()
ICCProfile
    ↓
┌───┴───┐
│       │
▼       ▼
XYZ → xy色度座標
XYZ → RGB（3D表示用）
```

## コンポーネント設計

### 設計パターン

#### 1. Presentational Components

**特徴**:

- UIの描画のみ
- ロジックを含まない
- Propsでデータを受け取る

**例**: ColorSpace2D.tsx

```typescript
interface ColorSpace2DProps {
  colorPoints: ColorPoint[]
  profileName?: string
  type: 'xy' | 'lab' | 'lch' | 'rgb-xy' | 'rgb-xz' | 'rgb-yz'
}

export default function ColorSpace2D({ colorPoints, profileName, type }: ColorSpace2DProps) {
  // 純粋な描画ロジック
}
```

#### 2. Container Components

**特徴**:

- 状態管理
- データフェッチ
- ロジック処理

**例**: app/page.tsx

```typescript
export default function Home() {
  const [profile, setProfile] = useState<ICCProfile | null>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // ファイル読み込みロジック
  }

  return (
    // Presentationalコンポーネントへの委譲
  )
}
```

### コンポーネント責務マトリクス

| コンポーネント         | 状態 | ロジック | 描画 | 再利用性 |
| ---------------------- | ---- | -------- | ---- | -------- |
| page.tsx               | ●    | ●        | ○    | ×        |
| ColorSpace2D           | ×    | ○        | ●    | ●        |
| ColorSpaceViewer       | ○    | ●        | ●    | ●        |
| GamutCoverageDashboard | ×    | ○        | ●    | ●        |
| ColorVisionSimulator   | ○    | ○        | ●    | ●        |
| ShareButton            | ●    | ●        | ●    | ●        |
| ExportButton           | ●    | ●        | ●    | ●        |

● = 主要責務 / ○ = 部分的責務 / × = なし

## アルゴリズム設計

### 1. 色域面積計算（Shoelace Formula）

**目的**: xy色度図上のポリゴン面積を計算

**アルゴリズム**:

```typescript
function calculatePolygonArea(points: { x: number; y: number }[]): number {
  let area = 0
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length
    area += points[i].x * points[j].y
    area -= points[j].x * points[i].y
  }
  return Math.abs(area) / 2
}
```

**計算量**: O(n) - n: 点の数

**精度**:

- プライマリカラー（3点）のみ使用
- 簡易的な三角形近似
- 実用上十分な精度

### 2. 点のソート（角度順）

**目的**: ポリゴンを正しく閉じるため

**アルゴリズム**:

```typescript
function sortPointsByAngle(points: { x: number; y: number }[]): { x: number; y: number }[] {
  // 1. 中心点を計算
  const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length
  const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length

  // 2. 各点の角度を計算してソート
  return [...points].sort((a, b) => {
    const angleA = Math.atan2(a.y - centerY, a.x - centerX)
    const angleB = Math.atan2(b.y - centerY, b.x - centerX)
    return angleA - angleB
  })
}
```

**計算量**: O(n log n)

**利点**:

- 凸包アルゴリズムより単純
- 小規模データセット（8点以下）に最適

### 3. 色覚シミュレーション（LMS変換）

**目的**: 異なる色覚タイプでの見え方をシミュレート

**アルゴリズム**:

```
RGB → Linear RGB → LMS → Modified LMS → Linear RGB → RGB
  ↑     (sRGB逆変換)  ↑    (色覚変換)      ↑    (sRGB変換)  ↑
```

**変換行列（Hunt-Pointer-Estevez）**:

```
L   0.31399  0.63951  0.04650   R_linear
M = 0.15537  0.75789  0.08670 × G_linear
S   0.01775  0.10944  0.87257   B_linear
```

**色覚変換例（1型色覚）**:

```
L_simulated = 2.02344 × M - 2.52581 × S
M_simulated = M
S_simulated = S
```

## UI/UX設計

### デザイン原則

1. **Progressive Disclosure**
   - 基本機能は常に見える
   - 詳細機能は展開可能

2. **Feedback Loop**
   - 操作結果を即座に表示
   - ローディング状態を明示

3. **Error Recovery**
   - エラーメッセージは具体的に
   - リカバリー方法を提示

### カラースキーム

```typescript
// Tailwind CSS classes
const colorScheme = {
  primary: 'blue-500', // アクション
  secondary: 'purple-500', // 共有
  success: 'green-500', // エクスポート
  warning: 'yellow-500', // 警告
  danger: 'red-500', // 削除
  neutral: 'gray-500', // 背景
}
```

### レスポンシブデザイン

```typescript
// ブレークポイント
const breakpoints = {
  sm: '640px', // モバイル
  md: '768px', // タブレット
  lg: '1024px', // デスクトップ
  xl: '1280px', // 大画面
}
```

**レイアウト戦略**:

- モバイル: 縦並び（stack）
- タブレット: 2カラムグリッド
- デスクトップ: 3カラムグリッド

## エラーハンドリング戦略

### エラー分類

1. **ユーザーエラー**
   - 無効なファイル形式
   - ファイルサイズ超過
   - 破損したプロファイル

2. **システムエラー**
   - メモリ不足
   - ブラウザ非対応
   - ネットワークエラー（URL読み込み）

3. **プログラミングエラー**
   - 型エラー
   - null/undefined参照
   - 計算エラー

### エラーハンドリングパターン

```typescript
// パターン1: try-catch
try {
  const profile = await parseICCProfile(file)
  setProfile(profile)
} catch (err) {
  console.error('ICC parsing error:', err)
  setError(err instanceof Error ? err.message : 'プロファイルの解析に失敗しました')
  setProfile(null)
}

// パターン2: Optional chaining
const area = profile?.gamutVolume?.toFixed(6) ?? 'N/A'

// パターン3: Nullish coalescing
const name = profile.description || selectedFile?.name || 'Unknown'
```

## パフォーマンス設計

### メモ化戦略

```typescript
// 重い計算をメモ化
const coverages = useMemo(() => {
  return calculateStandardCoverages(colorPoints)
}, [colorPoints]) // colorPointsが変わった時のみ再計算

// SVG要素の生成をメモ化
const colorGrid = useMemo(() => {
  // 20×20 = 400個の要素生成
  return generateColorGrid()
}, [type, xRange, yRange])
```

### レンダリング最適化

```typescript
// 条件付きレンダリング
{profile && (
  <GamutCoverageDashboard colorPoints={profile.colorPoints} />
)}

// 遅延ロード
const ColorSpaceViewer = dynamic(() => import('@/components/ColorSpaceViewer'), {
  ssr: false
})
```

### パフォーマンス目標

| メトリクス       | 目標    | 現状 | 備考     |
| ---------------- | ------- | ---- | -------- |
| 初回ロード       | < 3秒   | ?    | 測定必要 |
| プロファイル解析 | < 500ms | ?    | 測定必要 |
| 3D描画FPS        | > 30fps | ?    | 測定必要 |
| カバレッジ計算   | < 100ms | ?    | 測定必要 |

## アクセシビリティ設計

### WCAG 2.1 AA準拠目標

**現状**: 未対応

**実装予定**:

1. **キーボードナビゲーション**

   ```typescript
   // Tab順序の最適化
   <button tabIndex={0}>...</button>

   // ショートカットキー
   useEffect(() => {
     const handleKeyPress = (e: KeyboardEvent) => {
       if (e.ctrlKey && e.key === 'o') {
         // Open file
       }
     }
   }, [])
   ```

2. **スクリーンリーダー対応**

   ```typescript
   <button aria-label="プロファイルをエクスポート">
     エクスポート
   </button>

   <div role="status" aria-live="polite">
     {isLoading && 'プロファイルを読み込んでいます...'}
   </div>
   ```

3. **コントラスト比**
   - テキスト: 4.5:1以上
   - UI要素: 3:1以上

## 国際化設計

### 多言語対応計画

**Phase 1: 構造準備**

```typescript
// lib/i18n.ts
export const translations = {
  en: {
    'profile.load': 'Load Profile',
    'profile.share': 'Share',
    'profile.export': 'Export',
  },
  ja: {
    'profile.load': 'プロファイルを読み込む',
    'profile.share': '共有',
    'profile.export': 'エクスポート',
  },
}
```

**Phase 2: 実装**

- next-i18next導入
- 動的言語切り替え
- URLベース言語検出

**対応予定言語**:

1. 日本語（現在）
2. 英語
3. 中国語（簡体字）
4. 韓国語

## セキュリティ設計

### 脅威モデル

1. **XSS攻撃**
   - **対策**: Reactのデフォルトエスケープ
   - **検証**: dangerouslySetInnerHTML不使用

2. **メモリ枯渇**
   - **対策**: ファイルサイズ警告
   - **検証**: 大きなファイルでのテスト

3. **プライバシー侵害**
   - **対策**: クライアントサイド処理
   - **検証**: ネットワークモニタリング

### CSP（Content Security Policy）

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  },
]
```

## テスト設計

### テストピラミッド

```
        /\
       /E2E\         1-2個（主要フロー）
      /------\
     / Integration \   10-20個（機能統合）
    /--------------\
   /   Unit Tests   \  50-100個（関数単位）
  /------------------\
```

### テストケース例

#### ユニットテスト

```typescript
// lib/gamut-coverage.test.ts
describe('calculateGamutArea', () => {
  it('should calculate triangle area correctly', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ]
    expect(calculateGamutArea(points)).toBeCloseTo(0.5)
  })

  it('should handle empty array', () => {
    expect(calculateGamutArea([])).toBe(0)
  })
})
```

#### 統合テスト

```typescript
// integration/coverage-dashboard.test.tsx
describe('GamutCoverageDashboard', () => {
  it('should display all standard color spaces', () => {
    render(<GamutCoverageDashboard colorPoints={mockColorPoints} />)
    expect(screen.getByText('sRGB')).toBeInTheDocument()
    expect(screen.getByText('Adobe RGB')).toBeInTheDocument()
  })
})
```

#### E2Eテスト

```typescript
// e2e/basic-workflow.spec.ts
test('should load and analyze profile', async ({ page }) => {
  await page.goto('/')
  await page.setInputFiles('#file-input', 'sample.icc')
  await expect(page.getByText('色域カバレッジ分析')).toBeVisible()
})
```

---

最終更新: 2025-11-17
