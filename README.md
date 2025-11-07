# cprof

**Color Profile 3D Viewer** - ICC/WCS/OCIOプロファイルを3Dで可視化する革新的なビューア

## 🎯 プロジェクト概要

cprofは、各種カラープロファイル（ICC、WCS、OpenColorIOなど）を読み込み、色空間を3Dでインタラクティブに可視化できるWebアプリケーションです。Rust + WebAssemblyで高速な解析処理を実現し、Three.jsで美しい3D表示を提供します。

## ✨ 特徴

- **完全クライアントサイド**: サーバー不要、プライバシー保護、オフライン動作可能
- **Rust + WebAssembly**: ネイティブ並みの高速ICC解析
- **3Dインタラクティブ表示**: マウスで回転・ズーム、複数プロファイル比較
- **多形式対応**: ICC、WCS、OpenColorIO、3D LUTなど
- **モダンスタック**: Next.js 14 + React 18 + TypeScript + Tailwind CSS

## 🚀 技術スタック

| レイヤー | 技術 | 用途 |
|---------|------|------|
| **フレームワーク** | Next.js 14 (App Router) | 静的エクスポート対応 |
| **言語** | TypeScript + Rust | フロントエンド + WebAssembly |
| **コア処理** | Rust → WebAssembly | ICC解析・色空間変換 |
| **3D表示** | Three.js + React Three Fiber | 色空間の3D可視化 |
| **スタイリング** | Tailwind CSS | モダンなUI |
| **ホスティング** | GitHub Pages / Cloudflare Pages | 静的サイト配信 |

## 📁 プロジェクト構成

```
cprof/
├── app/                   # Next.js App Router
├── components/            # Reactコンポーネント
├── lib/                   # ユーティリティ・WebAssembly
├── cprof-core/            # Rustコア（ICC解析エンジン）
├── test-profiles/         # テスト用ICCプロファイル（8種類）
├── public/                # 静的アセット
├── package.json
├── next.config.ts
├── tsconfig.json
└── tailwind.config.ts
```

## 🎨 サポートする色空間

- **標準**: sRGB
- **広色域**: Adobe RGB (1998), Display P3, ProPhoto RGB, Rec.2020
- **グレースケール**: sGrey
- **将来**: WCS、OpenColorIO、3D LUT

## 🛠 開発

```bash
# 依存関係インストール
npm install

# Rustコアをビルド（WebAssembly）
cd cprof-core
wasm-pack build --target web

# 開発サーバー起動
cd ..
npm run dev

# 静的エクスポート
npm run build
```

## 📝 ライセンス

MIT License

## 🙏 参考

テストプロファイルは以下のオープンソースプロジェクトから提供されています：

- [saucecontrol/Compact-ICC-Profiles](https://github.com/saucecontrol/Compact-ICC-Profiles) (CC0-1.0)
- [svgeesus/PNG-ICC-tests](https://github.com/svgeesus/PNG-ICC-tests)

プロジェクト構成は [machigai-salad](https://github.com/kako-jun/machigai-salad) を参考にしています。
