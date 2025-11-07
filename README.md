# cprof

**Color Profile 3D Viewer** - ICC/WCS/OCIO profiles visualizer

ICCプロファイルを3D空間で可視化し、色域をインタラクティブに探索できるWebアプリケーション

![cprof](https://img.shields.io/badge/status-beta-yellow)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Three.js](https://img.shields.io/badge/Three.js-0.170-green)

## ✨ 特徴

- 🎨 **3D可視化**: 色空間をインタラクティブな3Dで表示
- 🔄 **直感操作**: マウスで回転・ズーム可能
- 📁 **ドラッグ&ドロップ**: ICCファイルを簡単に読み込み
- 🚀 **高速**: TypeScriptによる軽量実装
- 🌐 **ブラウザ完結**: サーバー不要、ローカルで完全動作
- 📱 **レスポンシブ**: デスクトップ・モバイル対応

## 🎯 対応フォーマット

### 現在対応
- ✅ ICC v2/v4 プロファイル (.icc, .icm)
- ✅ RGB色空間
- ✅ グレースケール

### 将来対応予定
- 🔜 WCS (Windows Color System)
- 🔜 OpenColorIO (.ocio)
- 🔜 3D LUT (.cube)
- 🔜 CMYK色空間

## 🚀 クイックスタート

### 前提条件
- Node.js 18+
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/kako-jun/cprof.git
cd cprof

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:3000 を開く

### 使い方

1. **ファイルを選択**
   - ドラッグ&ドロップ
   - クリックして選択
   - サンプルボタンをクリック

2. **3D表示を操作**
   - 🖱️ ドラッグ: 回転
   - 🔍 ホイール: ズーム
   - 📊 色域の違いを比較

## 📦 サンプルプロファイル

以下のサンプルプロファイルが含まれています：

| プロファイル | 色域 | 用途 |
|------------|------|------|
| sRGB | 標準 | Web、一般ディスプレイ |
| Adobe RGB | 広 | 印刷、写真編集 |
| Display P3 | 広 | Apple製品、HDR |
| Rec.2020 | 超広 | 4K/8K映像 |
| ProPhoto RGB | 最大 | プロフェッショナル写真 |

## 🛠 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript 5.7
- **3D描画**: Three.js + React Three Fiber
- **スタイリング**: Tailwind CSS
- **将来**: Rust + WebAssembly (パフォーマンス最適化)

## 🏗 プロジェクト構造

```
cprof/
├── app/                    # Next.js App Router
│   ├── page.tsx           # メインページ
│   ├── layout.tsx         # レイアウト
│   └── globals.css        # グローバルスタイル
├── components/            # Reactコンポーネント
│   └── ColorSpaceViewer.tsx  # 3D表示コンポーネント
├── lib/                   # ユーティリティ
│   └── icc-parser.ts      # ICC解析ライブラリ
├── public/                # 静的ファイル
│   └── profiles/          # サンプルプロファイル
└── test-profiles/         # 開発用テストプロファイル
```

## 📦 デプロイ

### GitHub Pagesへのデプロイ

1. **GitHub Pages を有効化**
   - リポジトリの Settings → Pages
   - Source: GitHub Actions を選択

2. **自動デプロイ**
   - `main` または `claude/*` ブランチにpushすると自動デプロイ
   - `.github/workflows/deploy.yml`で設定済み
   - デプロイURL: `https://kako-jun.github.io/cprof/`

3. **手動ビルド**
```bash
# 静的ビルド
npm run build

# ローカルでプレビュー
cd out
python3 -m http.server 8000
# http://localhost:8000 で確認
```

### その他のホスティング

**Cloudflare Pages / Vercel / Netlify**でも簡単にデプロイ可能：
- ビルドコマンド: `npm run build`
- 出力ディレクトリ: `out`

## 🤝 コントリビューション

プルリクエスト歓迎！以下の改善アイデアを募集中：

- [ ] より多くの色空間対応（Lab, XYZ, etc.）
- [ ] プロファイル比較表示
- [ ] 色域の数値計算・表示
- [ ] Rust + WebAssemblyへの移行
- [ ] エクスポート機能

## 📄 ライセンス

MIT License

## 🔗 関連プロジェクト

- [xsg](https://github.com/kako-jun/xsg) - SVG最適化ツール（Rust製）

## 📝 参考資料

- [ICC Specification](https://www.color.org/specification/ICC.1-2022-05.pdf)
- [Compact ICC Profiles](https://github.com/saucecontrol/Compact-ICC-Profiles)
- [Three.js Documentation](https://threejs.org/docs/)

---

**開発中のプロジェクトです。フィードバック歓迎！**
