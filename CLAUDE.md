# cprof 開発者向けドキュメント

ICCプロファイルを3D空間で可視化するWebアプリ。

## プロジェクト構造

```
app/
├── page.tsx           # メインページ
├── layout.tsx         # レイアウト
└── globals.css        # グローバルスタイル

components/
└── ColorSpaceViewer.tsx  # 3D表示コンポーネント

lib/
└── icc-parser.ts      # ICC解析ライブラリ

public/
└── profiles/          # サンプルプロファイル

test-profiles/         # 開発用テストプロファイル
```

## ICC解析ライブラリ

### 対応仕様

- ICC v2/v4ヘッダー解析（128バイト）
- タグテーブル検索
- XYZタグ（rXYZ, gXYZ, bXYZ, wtpt）からの色域抽出
- s15Fixed16Number形式の固定小数点数読み取り

### 主要関数

```typescript
// ICCプロファイル解析
parseICCProfile(file: File): Promise<ICCProfile>

// ヘッダー解析
parseHeader(buffer: ArrayBuffer): ICCProfileHeader

// タグ検索
findTag(buffer: ArrayBuffer, tagSignature: string): { offset, size } | null

// XYZ値読み取り
readXYZ(buffer: ArrayBuffer, offset: number): { x, y, z }

// 色域体積計算（四面体近似）
calculateGamutVolume(points: ColorPoint[]): number
```

### データ構造

```typescript
interface ICCProfile {
  header: ICCProfileHeader
  colorPoints: ColorPoint[] // 8点（R,G,B,C,M,Y,W,K）
  gamutVolume?: number
  description?: string
}
```

## 3D表示

- Three.js + React Three Fiber
- XYZ色空間で色域を三角柱として表示
- 8頂点: R, G, B, Cyan, Magenta, Yellow, White, Black

## 依存パッケージ

| パッケージ         | 用途                   |
| ------------------ | ---------------------- |
| next               | フレームワーク         |
| react              | UI                     |
| three              | 3Dレンダリング         |
| @react-three/fiber | React + Three.js統合   |
| @react-three/drei  | Three.jsユーティリティ |
| tailwindcss        | スタイリング           |

## ビルド

```bash
npm run dev     # 開発サーバー
npm run build   # プロダクションビルド
npm run lint    # ESLint
```

## CI/CD

- **deploy.yml**: GitHub Pagesへ自動デプロイ
- **Husky + lint-staged**: pre-commit hooks

## 将来計画

- WCS (Windows Color System) 対応
- OpenColorIO (.ocio) 対応
- 3D LUT (.cube) 対応
- CMYK色空間対応
- Lab/XYZ色空間の直接表示
- プロファイル比較表示
- 色域体積の数値表示
- Rust + WebAssembly への移行（パフォーマンス最適化）

## 参考資料

- [ICC Specification](https://www.color.org/specification/ICC.1-2022-05.pdf)
- [Compact ICC Profiles](https://github.com/saucecontrol/Compact-ICC-Profiles)
