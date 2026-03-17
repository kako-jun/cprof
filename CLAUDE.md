# cprof - Color Profile 3D Viewer

## プロジェクト概要

**cprof**は、ブラウザベースのICCプロファイルビューアー。完全にクライアントサイドで動作し、デザイナー、印刷業者、写真家、映像制作者向けの包括的な色空間分析ツールを提供する。

**ビジョン**: 世界中のクリエイターが、**インストール不要**で**無料**で使える、**最も包括的な**ICCプロファイル分析ツール。

**キャッチフレーズ**: "See Colors, Share Vision" / "色を見る、視点を共有する"

**ライセンス**: MIT License

## 現在の状態（v1.0）

### 実装済み

- ICCプロファイルパーサー（v2/v4対応）
- 3D色空間ビューアー（Three.js）
- 2D色度図（6種類）
- 複数プロファイル比較（2つまで）
- 色域カバレッジ分析（5つの標準色空間）
- URLベースのプロファイル共有
- 色覚シミュレーション（8タイプ）
- データエクスポート（JSON/CSV/XYZ/Summary）

## プロジェクト構造

```
cprof/
├── app/
│   ├── page.tsx             # メインページ
│   ├── layout.tsx           # レイアウト
│   └── globals.css          # グローバルスタイル
├── components/
│   └── ColorSpaceViewer.tsx  # 3D表示コンポーネント
├── lib/
│   └── icc-parser.ts        # ICC解析ライブラリ
├── public/
│   └── profiles/            # サンプルプロファイル
├── test-profiles/           # 開発用テストプロファイル
└── docs/                    # ドキュメント
    ├── architecture.md
    ├── design.md
    ├── features.md
    ├── implementation-features.md
    ├── overview.md
    ├── platforms.md
    ├── roadmap.md
    └── user-guide.md
```

## 技術スタック

| パッケージ         | 用途                   |
| ------------------ | ---------------------- |
| Next.js 15.5.6     | フレームワーク         |
| React              | UI                     |
| TypeScript         | 型安全性               |
| Three.js           | 3Dレンダリング         |
| @react-three/fiber | React + Three.js統合   |
| @react-three/drei  | Three.jsユーティリティ |
| Tailwind CSS       | スタイリング           |
| ESLint + Prettier  | コード品質             |
| Husky + lint-staged| Git hooks              |

## ビルド

```bash
npm run dev     # 開発サーバー
npm run build   # プロダクションビルド
npm run lint    # ESLint
```

## CI/CD

- **deploy.yml**: GitHub Pagesへ自動デプロイ
- **Husky + lint-staged**: pre-commit hooks

## ICC解析ライブラリ

### 対応仕様

- ICC v2/v4ヘッダー解析（128バイト）
- タグテーブル検索
- XYZタグ（rXYZ, gXYZ, bXYZ, wtpt）からの色域抽出
- s15Fixed16Number形式の固定小数点数読み取り

### 主要関数

```typescript
parseICCProfile(file: File): Promise<ICCProfile>
parseHeader(buffer: ArrayBuffer): ICCProfileHeader
findTag(buffer: ArrayBuffer, tagSignature: string): { offset, size } | null
readXYZ(buffer: ArrayBuffer, offset: number): { x, y, z }
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

## 競合優位性

| 機能                 | cprof    | ColorThink Pro | GamutVision  | ICCView  |
| -------------------- | -------- | -------------- | ------------ | -------- |
| プラットフォーム     | ブラウザ | デスクトップ   | デスクトップ | ブラウザ |
| 価格                 | 無料     | $300+          | 無料         | 無料     |
| 3D表示               | Yes      | Yes            | Yes          | Yes      |
| カバレッジ分析       | Yes      | Yes            | No           | No       |
| URL共有              | Yes      | No             | No           | No       |
| 色覚シミュレーション | Yes      | No             | No           | No       |
| データエクスポート   | Yes      | Yes            | No           | No       |
| オープンソース       | Yes      | No             | Yes          | ?        |

## ターゲットユーザー

- **プライマリ**: グラフィックデザイナー、印刷業者、写真家、映像制作者
- **セカンダリ**: 開発者、教育者、研究者

## ロードマップ

- **Phase 1** (完了): コア機能安定化
- **Phase 2** (次): ユーザビリティ向上 — リアルタイム画像プレビュー、Out-of-gamut検出、多言語対応
- **Phase 3**: プロフェッショナル機能 — LUT生成、カラーグレーディング、プリセット管理
- **Phase 4**: コラボレーション — コレクション共有、API提供、プラグインシステム
- **Phase 5**: エンタープライズ — PWA、バッチ処理、カスタムレポート

## 将来計画（技術）

- WCS (Windows Color System) 対応
- OpenColorIO (.ocio) 対応
- 3D LUT (.cube) 対応
- CMYK色空間対応
- Lab/XYZ色空間の直接表示
- Rust + WebAssembly への移行（パフォーマンス最適化）

## バックログ

- TypeScriptの厳格化
- パフォーマンス最適化
- ユニットテスト・E2Eテストの追加

## 参考資料

- [ICC Specification v4.4](https://www.color.org/specification/ICC.1-2022-05.pdf)
- [CIE 1931 Color Space](https://en.wikipedia.org/wiki/CIE_1931_color_space)
- [sRGB](https://en.wikipedia.org/wiki/SRGB)
- [Adobe RGB](https://en.wikipedia.org/wiki/Adobe_RGB_color_space)
- [Color Vision Deficiency](https://www.nei.nih.gov/learn-about-eye-health/eye-conditions-and-diseases/color-blindness)
- [Brettel et al. (1997)](https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html)
- [Compact ICC Profiles](https://github.com/saucecontrol/Compact-ICC-Profiles)

## 連絡先

- **GitHub**: https://github.com/kako-jun/cprof
- **Issues**: バグ報告・機能提案
- **Discussions**: 質問・議論
