# cprof - アーキテクチャ設計

## 概要

cprofは、クライアントサイドで完結するSPA（Single Page Application）として設計されています。サーバーサイド処理は一切不要で、すべての処理がブラウザ内で完結します。

## システムアーキテクチャ

```
┌─────────────────────────────────────────────────────┐
│                   Browser                            │
│                                                       │
│  ┌────────────────────────────────────────────┐    │
│  │           Next.js App (SSG)                 │    │
│  │                                              │    │
│  │  ┌──────────────┐  ┌──────────────┐       │    │
│  │  │ UI Components │  │ 3D Viewer    │       │    │
│  │  │              │  │ (Three.js)   │       │    │
│  │  └──────┬───────┘  └──────┬───────┘       │    │
│  │         │                  │                │    │
│  │         └──────┬───────────┘                │    │
│  │                │                             │    │
│  │         ┌──────▼──────────┐                │    │
│  │         │  Business Logic  │                │    │
│  │         │  (lib/)          │                │    │
│  │         └──────┬───────────┘                │    │
│  │                │                             │    │
│  │         ┌──────▼──────────┐                │    │
│  │         │  Browser APIs    │                │    │
│  │         │  File, Clipboard │                │    │
│  │         └──────────────────┘                │    │
│  └────────────────────────────────────────────┘    │
│                                                       │
└─────────────────────────────────────────────────────┘
```

## レイヤー構成

### 1. プレゼンテーション層（components/）

**責務**: UIの描画とユーザーインタラクション

```
components/
├── ColorSpace2D.tsx              # 2D色度図
├── ColorSpaceViewer.tsx          # 3D色空間（Three.js）
├── GamutCoverageDashboard.tsx    # カバレッジダッシュボード
├── ColorVisionSimulator.tsx      # 色覚シミュレーター
├── ShareButton.tsx               # 共有ボタン
└── ExportButton.tsx              # エクスポートボタン
```

**設計原則**:

- Presentational vs Container分離
- 単一責任の原則
- Propsによる疎結合

### 2. ビジネスロジック層（lib/）

**責務**: データ処理、計算、変換

```
lib/
├── icc-parser.ts        # ICCプロファイル解析
├── gamut-coverage.ts    # 色域カバレッジ計算
├── color-vision.ts      # 色覚シミュレーション
├── profile-sharing.ts   # URL共有
└── data-export.ts       # データエクスポート
```

**設計原則**:

- 純粋関数優先
- 副作用の局所化
- 型安全性の徹底

### 3. アプリケーション層（app/）

**責務**: ページ構成、ルーティング、状態管理

```
app/
└── page.tsx             # メインページ（状態管理）
```

**設計原則**:

- React Hooks活用
- useState/useEffectによる状態管理
- useMemoによるパフォーマンス最適化

## データフロー

### 1. プロファイル読み込みフロー

```
User Action
    ↓
File Input/Drag&Drop/URL
    ↓
parseICCProfile(file)
    ↓
ICCProfile Object
    ↓
├─→ 3D Viewer (colorPoints)
├─→ 2D Diagrams (colorPoints)
├─→ Coverage Dashboard (colorPoints)
├─→ Vision Simulator (colorPoints)
└─→ Export (entire profile)
```

### 2. カバレッジ計算フロー

```
ColorPoints
    ↓
calculateGamutArea()
    ↓
Polygon Area (Shoelace Formula)
    ↓
calculateCoverage(target, reference)
    ↓
Coverage Percentage
    ↓
GamutCoverageDashboard
```

### 3. 色覚シミュレーションフロー

```
RGB Color
    ↓
rgbToLms()
    ↓
LMS Color Space
    ↓
simulateColorVision(lms, visionType)
    ↓
Modified LMS
    ↓
lmsToRgb()
    ↓
Simulated RGB
```

## 状態管理戦略

### ローカル状態（useState）

```typescript
// ファイル管理
const [selectedFile, setSelectedFile] = useState<File | null>(null)
const [selectedFile2, setSelectedFile2] = useState<File | null>(null)

// プロファイルデータ
const [profile, setProfile] = useState<ICCProfile | null>(null)
const [profile2, setProfile2] = useState<ICCProfile | null>(null)

// UI状態
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [compareMode, setCompareMode] = useState(false)
```

**なぜグローバル状態管理ライブラリを使わないか:**

- アプリケーションが単一ページ
- 状態が比較的シンプル
- 親→子へのProps渡しで十分
- 依存を最小限に保ちたい

### 派生状態（useMemo）

```typescript
// 計算コストの高い処理をメモ化
const coverages = useMemo(() => {
  return calculateStandardCoverages(colorPoints)
}, [colorPoints])

const sortedData = useMemo(() => {
  return sortPointsByAngle(data)
}, [data])
```

## パフォーマンス戦略

### 1. コード分割

```typescript
// Three.jsは大きいので遅延ロード
const ColorSpaceViewer = dynamic(() => import('@/components/ColorSpaceViewer'), {
  ssr: false,
})
```

### 2. メモ化

- **useMemo**: 重い計算のキャッシュ
- **React.memo**: 不要な再レンダリング防止（将来実装）

### 3. 最適化候補

```typescript
// TODO: 大量の点を扱う場合
// - Web Workers for heavy calculations
// - Virtual scrolling for long lists
// - Canvas rendering for large datasets
```

## セキュリティ考慮事項

### 1. クライアントサイド処理

**利点**:

- ユーザーデータがサーバーに送信されない
- プライバシー保護

**注意点**:

- ファイルサイズの制限なし（メモリに注意）
- 悪意あるプロファイルの処理

### 2. URL共有

**脅威**:

- URLが長すぎてブラウザの制限
- Base64デコード時のエラー

**対策**:

- URLサイズの警告表示
- try-catchによるエラーハンドリング

### 3. XSS対策

**対策**:

- Reactのデフォルトエスケープに依存
- dangerouslySetInnerHTMLは使用しない
- ユーザー入力は最小限

## スケーラビリティ

### 現在の制限

1. **プロファイル数**: 2つまで同時比較
2. **ファイルサイズ**: ブラウザのメモリ次第
3. **色点数**: 8点（RGB立方体の頂点）

### 拡張可能性

```typescript
// 将来の拡張ポイント

// 1. 複数プロファイル対応
interface ProfileState {
  profiles: ICCProfile[] // 配列化
  activeIndex: number
}

// 2. プラグインシステム
interface Plugin {
  name: string
  version: string
  load: (profile: ICCProfile) => void
  render: () => JSX.Element
}

// 3. ワーカー対応
// lib/workers/
//   ├── icc-parser.worker.ts
//   ├── coverage-calculator.worker.ts
//   └── vision-simulator.worker.ts
```

## テスタビリティ

### 現状

- ユニットテストなし
- E2Eテストなし

### 推奨テスト戦略

```
tests/
├── unit/
│   ├── icc-parser.test.ts
│   ├── gamut-coverage.test.ts
│   ├── color-vision.test.ts
│   └── profile-sharing.test.ts
├── integration/
│   ├── profile-loading.test.tsx
│   └── coverage-calculation.test.tsx
└── e2e/
    ├── basic-workflow.spec.ts
    └── sharing-workflow.spec.ts
```

**ツール候補**:

- **Vitest**: ユニット/統合テスト
- **Playwright**: E2Eテスト
- **Testing Library**: Reactコンポーネントテスト

## デプロイメント

### 静的サイト生成（SSG）

```bash
npm run build
# → out/ ディレクトリに静的ファイル生成
```

### ホスティングオプション

1. **GitHub Pages** - 無料、簡単
2. **Vercel** - Next.js最適化
3. **Netlify** - CDN、フォーム対応
4. **Cloudflare Pages** - 高速、グローバル

### CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm test # テスト追加後
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```

## モニタリング

### 推奨メトリクス

1. **パフォーマンス**
   - ページロード時間
   - プロファイル解析時間
   - 3D描画FPS

2. **使用状況**
   - プロファイル読み込み数
   - 共有リンク生成数
   - エクスポート実行数

3. **エラー**
   - 解析失敗率
   - ブラウザエラー
   - パフォーマンス警告

### ツール候補

- **Google Analytics 4** - 基本的なアクセス解析
- **Sentry** - エラートラッキング
- **Web Vitals** - Core Web Vitals測定

## 技術的負債の管理

### 既知の課題

1. **TypeScript厳格化**
   - `any`型の排除
   - `strict`モードの有効化

2. **テストカバレッジ**
   - ユニットテスト: 0%
   - 統合テスト: 0%
   - E2Eテスト: 0%

3. **アクセシビリティ**
   - WAI-ARIA対応不足
   - キーボードナビゲーション未実装

4. **国際化**
   - ハードコードされた日本語テキスト
   - i18n未実装

### リファクタリング優先度

**高**:

- [ ] TypeScript厳格化
- [ ] ユニットテスト追加

**中**:

- [ ] アクセシビリティ改善
- [ ] パフォーマンス最適化

**低**:

- [ ] 国際化対応
- [ ] プラグインシステム

---

最終更新: 2025-11-17
