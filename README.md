# cprof

ICCプロファイルを3D空間で可視化するWebアプリ。

## 特徴

- ICCプロファイルの色域を3D表示
- ドラッグ&ドロップでファイル読み込み
- マウスで回転・ズーム操作
- ブラウザ完結（サーバー不要）

## 対応フォーマット

- ICC v2/v4 プロファイル (.icc, .icm)
- RGB色空間
- グレースケール

## サンプルプロファイル

| プロファイル | 色域 | 用途                   |
| ------------ | ---- | ---------------------- |
| sRGB         | 標準 | Web、一般ディスプレイ  |
| Adobe RGB    | 広   | 印刷、写真編集         |
| Display P3   | 広   | Apple製品、HDR         |
| Rec.2020     | 超広 | 4K/8K映像              |
| ProPhoto RGB | 最大 | プロフェッショナル写真 |

## セットアップ

```bash
git clone https://github.com/kako-jun/cprof.git
cd cprof
npm install
npm run dev
```

http://localhost:3000 で開く

## 使い方

1. ICCファイルをドラッグ&ドロップ（またはクリックして選択）
2. サンプルボタンでプリセットを読み込み
3. マウスドラッグで回転、ホイールでズーム

## 技術スタック

- Next.js 15
- React 19 + TypeScript
- Three.js + React Three Fiber
- Tailwind CSS

## ライセンス

MIT
