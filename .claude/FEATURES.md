# cprof - 機能仕様書

## 概要

cprof（Color Profile Viewer）は、ブラウザベースのICCプロファイルビューアーです。
完全にクライアントサイドで動作し、3D/2D色空間の可視化、色域カバレッジ分析、URLベースの共有機能を提供します。

## 実装済み機能

### 1. 色度図の描画改善（2025-11-17実装）

#### 問題点

- 点が正しく結ばれず、色域ポリゴンが不正確
- 馬蹄形のスペクトル軌跡がなかった
- 背景が単色で視認性が低かった

#### 解決策

**ファイル:** `components/ColorSpace2D.tsx`

- **点のソート処理** (line 72-85)
  - 中心点からの角度で点をソートして正しいポリゴンを形成
  - `sortPointsByAngle()` 関数を実装

- **スペクトル軌跡の追加** (line 15-81)
  - CIE xy色度図の馬蹄形（380nm-780nm）を定数として定義
  - グレーの点線で描画（line 188-204）

- **カラフルな背景** (line 139-167)
  - 20×20グリッドでxy座標ごとに色を計算
  - XYZ→sRGB変換を実装（line 84-108）
  - 半透明（opacity: 0.3）で表示

### 2. 色域カバレッジ分析システム

#### 目的

標準色空間（sRGB, Adobe RGB, P3等）との定量的な比較を提供

#### 実装ファイル

**`lib/gamut-coverage.ts`**

- **面積計算** (line 13-23)

  ```typescript
  calculatePolygonArea(): Shoelace formulaで2Dポリゴンの面積を計算
  ```

- **色度座標変換** (line 28-35)

  ```typescript
  toXYChromaticity(): XYZ → xy色度座標
  ```

- **カバレッジ計算** (line 92-100)

  ```typescript
  calculateCoverage(target, reference):
    return (targetArea / referenceArea) * 100
  ```

- **標準色空間プリセット** (line 153-206)
  - sRGB: Web標準色域
  - Adobe RGB (1998): 広色域（印刷向け）
  - Display P3: DCI-P3（Apple/映画産業）
  - Rec. 2020: ITU-R BT.2020（4K/8K/HDR）
  - ProPhoto RGB: 超広色域（RAW現像向け）

**`components/GamutCoverageDashboard.tsx`**

- プログレスバーで視覚的に表示
- 色分けされたインジケーター:
  - 🟢 緑 (100%以上): 基準より広い
  - 🔵 青 (90-100%): ほぼ同等
  - 🟡 黄 (70-90%): やや狭い
  - 🟠 橙 (50-70%): かなり狭い
  - 🔴 赤 (50%未満): 非常に狭い

### 3. URLベースのプロファイル共有機能

#### 目的

プロファイルをURLに埋め込んで簡単に共有

#### 実装ファイル

**`lib/profile-sharing.ts`**

- **Base64エンコード/デコード** (line 13-36)

  ```typescript
  arrayBufferToBase64(): ArrayBuffer → Base64文字列
  base64ToArrayBuffer(): Base64文字列 → ArrayBuffer
  fileToBase64(): File → Base64
  base64ToFile(): Base64 → File
  ```

- **URL生成** (line 47-54)

  ```typescript
  createProfileURL(file, base64Data):
    URLSearchParams with 'profile' and 'name'
  ```

- **URL解析** (line 59-70)

  ```typescript
  extractProfileFromURL(): URLパラメータから取得
  ```

- **クリップボードコピー** (line 90-117)
  - navigator.clipboard API使用
  - フォールバック: execCommand('copy')

**`components/ShareButton.tsx`**

- モーダルUIで共有リンクを表示
- ワンクリックでクリップボードにコピー
- URL長の警告（2048文字超）

**`app/page.tsx`** (line 140-159)

- useEffectでページ読み込み時にURL解析
- 自動的にプロファイルを読み込んで表示

### 4. 複数プロファイル比較機能（既存機能の拡張）

**`app/page.tsx`**

- 2つのプロファイルを同時表示
- それぞれの色域カバレッジダッシュボードを表示
- 3D空間で重ね合わせ表示
- 各プロファイルの共有ボタンを配置

## ディレクトリ構成

```
cprof/
├── app/
│   └── page.tsx                    # メインページ（統合UI）
├── components/
│   ├── ColorSpace2D.tsx            # 2D色空間ビューアー（改善）
│   ├── ColorSpaceViewer.tsx        # 3D色空間ビューアー
│   ├── GamutCoverageDashboard.tsx  # カバレッジダッシュボード（新規）
│   └── ShareButton.tsx             # 共有ボタン（新規）
├── lib/
│   ├── icc-parser.ts              # ICCプロファイルパーサー
│   ├── gamut-coverage.ts          # 色域カバレッジ計算（新規）
│   └── profile-sharing.ts         # URL共有ユーティリティ（新規）
└── public/
    └── profiles/                   # サンプルプロファイル
```

## 使い方

### 1. プロファイルの読み込み

**方法A: ファイルアップロード**

1. ドラッグ&ドロップエリアにICCファイルをドロップ
2. またはクリックしてファイルピッカーから選択

**方法B: サンプルプロファイル**

- ボタンをクリックして標準プロファイルを読み込み
- sRGB, Adobe RGB, Display P3, Rec.2020, ProPhoto RGB

**方法C: URL共有リンク**

```
https://your-domain.com/?profile=BASE64_DATA&name=filename.icc
```

### 2. 色域カバレッジの確認

プロファイル読み込み後、自動的に表示される：

- **色度図上の面積**: xy平面での色域サイズ
- **標準色空間との比較**: 5つの標準色空間とのカバレッジ（%）

### 3. プロファイルの共有

1. プロファイル情報カードの「共有」ボタンをクリック
2. モーダルで表示されたURLをコピー
3. 相手に送信（メール、Slack、GitHubなど）
4. 相手はURLをクリックするだけで表示可能

### 4. プロファイルの比較

1. 最初のプロファイルを読み込み
2. 「+ 比較」ボタンをクリック
3. 2つ目のプロファイルを選択
4. 3D空間で両方が表示され、カバレッジも並んで表示

## 技術仕様

### 色域面積計算

**Shoelace Formula（靴紐公式）**

```typescript
Area = |Σ(x[i] * y[i+1] - x[i+1] * y[i])| / 2
```

### カバレッジ計算

```typescript
Coverage = (Target Area / Reference Area) × 100
```

- 100%以上 = ターゲットが基準より広い色域を持つ
- 100% = 完全一致
- 100%未満 = ターゲットが基準より狭い

### XYZ → sRGB 変換

**変換マトリックス（D65白色点）**

```
R = 3.2406*X - 1.5372*Y - 0.4986*Z
G = -0.9689*X + 1.8758*Y + 0.0415*Z
B = 0.0557*X - 0.2040*Y + 1.0570*Z
```

**ガンマ補正（sRGB）**

```typescript
if (c <= 0.0031308) {
  return 12.92 * c
} else {
  return (1.055 * c) ^ (1 / 2.4 - 0.055)
}
```

### URL共有のデータ構造

```
?profile=<Base64エンコードされたICCファイル>&name=<ファイル名>
```

- Base64エンコードでバイナリデータをURLに埋め込み
- 2048文字を超える場合は警告を表示
- 一部のブラウザ/アプリで制限がある可能性

## パフォーマンス最適化

### useMemoの活用

- `colorGrid`: xy色度図の背景グリッド（20×20=400要素）
- `sortedData`: 角度ソート済みの点
- `coverages`: 標準色空間との比較結果

### Dynamic Import

```typescript
const ColorSpaceViewer = dynamic(() => import('@/components/ColorSpaceViewer'), {
  ssr: false,
})
```

Three.jsを含む3Dビューアーは遅延ロード

## ブラウザ互換性

### 必須API

- File API
- ArrayBuffer
- Canvas / SVG
- ES6+ (async/await, arrow functions)

### オプショナルAPI

- Clipboard API (共有機能)
  - フォールバック: document.execCommand('copy')
- URL API (共有機能)

### 対応ブラウザ

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 今後の拡張可能性

### 実装候補

1. **画像プレビュー機能**
   - プロファイル適用前後の比較
   - Out-of-gamut検出

2. **色盲シミュレーション**
   - 1型、2型、3型色覚
   - アクセシビリティチェック

3. **エクスポート機能**
   - JSON/CSV形式
   - 3D点群データ

4. **PWA対応**
   - オフライン動作
   - インストール可能

5. **LUT生成**
   - カラーグレーディング用
   - 3D LUT出力

## ライセンス

MIT License

## 貢献

GitHubでのプルリクエストを歓迎します。
大きな変更の場合は、まずissueで議論してください。

## 参考資料

- ICC Specification: https://www.color.org/specification/ICC.1-2022-05.pdf
- CIE 1931 Color Space: https://en.wikipedia.org/wiki/CIE_1931_color_space
- sRGB: https://en.wikipedia.org/wiki/SRGB
- Adobe RGB: https://en.wikipedia.org/wiki/Adobe_RGB_color_space
