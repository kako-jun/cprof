# Test ICC Profiles

このディレクトリには、cprofの開発・テスト用のサンプルICCプロファイルが含まれています。

## 収集したプロファイル

### 標準色域（Standard Gamut）

| ファイル名 | サイズ | 色空間 | バージョン | 説明 |
|-----------|--------|--------|-----------|------|
| `sRGB-v2-nano.icc` | 410B | sRGB | v2 | 超コンパクトなsRGBプロファイル |
| `sRGB-v4.icc` | 480B | sRGB | v4 | ミニマルなsRGB v4プロファイル |
| `sRGB-v4-ICC_preference.icc` | 60KB | sRGB | v4 | ICC公式のsRGB v4リファレンスプロファイル（フル機能版） |

### 広色域（Wide Gamut）

| ファイル名 | サイズ | 色空間 | バージョン | 説明 |
|-----------|--------|--------|-----------|------|
| `AdobeCompat-v4.icc` | 480B | Adobe RGB | v4 | Adobe RGB (1998)互換プロファイル |
| `DisplayP3-v4.icc` | 480B | Display P3 | v4 | Apple Display P3色空間（DCI-P3ベース） |
| `ProPhoto-v4.icc` | 480B | ProPhoto RGB | v4 | 超広色域プロファイル（写真編集用） |
| `Rec2020-v4.icc` | 480B | Rec.2020 | v4 | HDR/4K映像用広色域（ITU-R BT.2020） |

### グレースケール

| ファイル名 | サイズ | 色空間 | バージョン | 説明 |
|-----------|--------|--------|-----------|------|
| `sGrey-v4.icc` | 360B | Greyscale | v4 | sRGB準拠グレースケールプロファイル |

## 色域の比較

色域の広さ（小→大）:
```
sRGB < Display P3 < Adobe RGB < Rec.2020 < ProPhoto RGB
```

## テストケースとしての利用

これらのプロファイルは以下のテストに使用できます：

1. **サイズバリエーション**: 360B～60KBまで
2. **バージョン**: ICC v2とv4
3. **色域**: 標準色域から超広色域まで
4. **用途**: Web、印刷、映像、写真編集
5. **カラー vs グレースケール**

## 出典

すべてのプロファイルはCC0 (Public Domain) またはICC公式ライセンスの下で配布されています：

- [saucecontrol/Compact-ICC-Profiles](https://github.com/saucecontrol/Compact-ICC-Profiles) (CC0-1.0)
- [svgeesus/PNG-ICC-tests](https://github.com/svgeesus/PNG-ICC-tests) (ICC公式)

## 3D可視化での見た目の違い

cprofで表示すると、以下のような違いが視覚化されます：

- **sRGB**: 標準的な三角柱状の色域
- **Display P3**: sRGBより赤色方向に広い
- **Adobe RGB**: sRGBよりシアン方向に広い
- **ProPhoto RGB**: 人間の視覚を超える超広色域
- **Rec.2020**: 将来の映像規格を見据えた広色域
