/**
 * ICC Profile Parser
 *
 * ICC (International Color Consortium) プロファイルを解析し、
 * 色空間データを抽出するライブラリ
 */

export interface ICCProfileHeader {
  size: number;
  preferredCMM: string;
  version: string;
  deviceClass: string;
  colorSpace: string;
  pcs: string; // Profile Connection Space
  dateTime: Date;
  signature: string;
  platform: string;
  manufacturer: string;
  model: string;
}

export interface ColorPoint {
  x: number;
  y: number;
  z: number;
  label?: string;
  color?: string;
}

export interface ICCProfile {
  header: ICCProfileHeader;
  colorPoints: ColorPoint[];
  gamutVolume?: number;
  description?: string;
}

/**
 * バイナリデータから32ビット整数を読み取る（ビッグエンディアン）
 */
function readUInt32BE(buffer: ArrayBuffer, offset: number): number {
  const view = new DataView(buffer);
  return view.getUint32(offset, false); // false = big endian
}

/**
 * バイナリデータから16ビット整数を読み取る（ビッグエンディアン）
 */
function readUInt16BE(buffer: ArrayBuffer, offset: number): number {
  const view = new DataView(buffer);
  return view.getUint16(offset, false);
}

/**
 * バイナリデータから文字列を読み取る
 */
function readString(buffer: ArrayBuffer, offset: number, length: number): string {
  const view = new Uint8Array(buffer, offset, length);
  return String.fromCharCode(...view).replace(/\0/g, '').trim();
}

/**
 * カラースペース識別子を人間が読める形式に変換
 */
function colorSpaceToString(signature: string): string {
  const map: Record<string, string> = {
    'RGB ': 'RGB',
    'CMYK': 'CMYK',
    'GRAY': 'Grayscale',
    'Lab ': 'Lab',
    'XYZ ': 'XYZ',
  };
  return map[signature] || signature;
}

/**
 * デバイスクラスを人間が読める形式に変換
 */
function deviceClassToString(signature: string): string {
  const map: Record<string, string> = {
    'scnr': 'Scanner',
    'mntr': 'Monitor',
    'prtr': 'Printer',
    'link': 'Link',
    'spac': 'ColorSpace',
    'abst': 'Abstract',
    'nmcl': 'NamedColor',
  };
  return map[signature] || signature;
}

/**
 * ICCプロファイルのヘッダーを解析
 */
function parseHeader(buffer: ArrayBuffer): ICCProfileHeader {
  // ICC仕様: ヘッダーは128バイト
  const size = readUInt32BE(buffer, 0);
  const preferredCMM = readString(buffer, 4, 4);
  const versionMajor = new Uint8Array(buffer, 8, 1)[0];
  const versionMinor = (new Uint8Array(buffer, 9, 1)[0] >> 4);
  const version = `${versionMajor}.${versionMinor}`;

  const deviceClass = readString(buffer, 12, 4);
  const colorSpace = readString(buffer, 16, 4);
  const pcs = readString(buffer, 20, 4);

  // 日時（12バイト: 年2, 月2, 日2, 時2, 分2, 秒2）
  const year = readUInt16BE(buffer, 24);
  const month = readUInt16BE(buffer, 26);
  const day = readUInt16BE(buffer, 28);
  const hour = readUInt16BE(buffer, 30);
  const minute = readUInt16BE(buffer, 32);
  const second = readUInt16BE(buffer, 34);
  const dateTime = new Date(year, month - 1, day, hour, minute, second);

  const signature = readString(buffer, 36, 4);
  const platform = readString(buffer, 40, 4);
  const manufacturer = readString(buffer, 48, 4);
  const model = readString(buffer, 52, 4);

  return {
    size,
    preferredCMM,
    version,
    deviceClass: deviceClassToString(deviceClass),
    colorSpace: colorSpaceToString(colorSpace),
    pcs: colorSpaceToString(pcs),
    dateTime,
    signature,
    platform,
    manufacturer,
    model,
  };
}

/**
 * タグテーブルからタグを検索
 */
function findTag(buffer: ArrayBuffer, tagSignature: string): { offset: number; size: number } | null {
  const tagCount = readUInt32BE(buffer, 128);

  for (let i = 0; i < tagCount; i++) {
    const tagTableOffset = 132 + i * 12;
    const signature = readString(buffer, tagTableOffset, 4);

    if (signature === tagSignature) {
      const offset = readUInt32BE(buffer, tagTableOffset + 4);
      const size = readUInt32BE(buffer, tagTableOffset + 8);
      return { offset, size };
    }
  }

  return null;
}

/**
 * XYZ値を読み取る（s15Fixed16Number形式）
 */
function readXYZ(buffer: ArrayBuffer, offset: number): { x: number; y: number; z: number } {
  const view = new DataView(buffer);

  // s15Fixed16Number: 符号付き固定小数点（上位16ビット: 整数部、下位16ビット: 小数部）
  const xRaw = view.getInt32(offset + 8, false);
  const yRaw = view.getInt32(offset + 12, false);
  const zRaw = view.getInt32(offset + 16, false);

  const x = xRaw / 65536;
  const y = yRaw / 65536;
  const z = zRaw / 65536;

  return { x, y, z };
}

/**
 * RGB色空間の色域を生成（三角柱の頂点）
 */
function generateRGBGamut(
  redXYZ: { x: number; y: number; z: number },
  greenXYZ: { x: number; y: number; z: number },
  blueXYZ: { x: number; y: number; z: number },
  whiteXYZ: { x: number; y: number; z: number }
): ColorPoint[] {
  const points: ColorPoint[] = [];

  // プライマリカラー（最大輝度）
  points.push({ ...redXYZ, label: 'Red', color: '#ff0000' });
  points.push({ ...greenXYZ, label: 'Green', color: '#00ff00' });
  points.push({ ...blueXYZ, label: 'Blue', color: '#0000ff' });

  // 二次色
  points.push({
    x: redXYZ.x + greenXYZ.x,
    y: redXYZ.y + greenXYZ.y,
    z: redXYZ.z + greenXYZ.z,
    label: 'Yellow',
    color: '#ffff00',
  });

  points.push({
    x: greenXYZ.x + blueXYZ.x,
    y: greenXYZ.y + blueXYZ.y,
    z: greenXYZ.z + blueXYZ.z,
    label: 'Cyan',
    color: '#00ffff',
  });

  points.push({
    x: redXYZ.x + blueXYZ.x,
    y: redXYZ.y + blueXYZ.y,
    z: redXYZ.z + blueXYZ.z,
    label: 'Magenta',
    color: '#ff00ff',
  });

  // 白とブラック
  points.push({ ...whiteXYZ, label: 'White', color: '#ffffff' });
  points.push({ x: 0, y: 0, z: 0, label: 'Black', color: '#000000' });

  return points;
}

/**
 * ICCプロファイルを解析してメイン関数
 */
export async function parseICCProfile(file: File): Promise<ICCProfile> {
  const arrayBuffer = await file.arrayBuffer();

  // ヘッダー解析
  const header = parseHeader(arrayBuffer);

  // descタグから説明を取得（オプション）
  const descTag = findTag(arrayBuffer, 'desc');
  let description = file.name;

  if (descTag) {
    try {
      // 簡易的なdesc読み取り（ASCII）
      const descType = readString(arrayBuffer, descTag.offset, 4);
      if (descType === 'desc') {
        const descLength = readUInt32BE(arrayBuffer, descTag.offset + 8);
        description = readString(arrayBuffer, descTag.offset + 12, Math.min(descLength, 100));
      }
    } catch (e) {
      console.warn('Failed to read description:', e);
    }
  }

  let colorPoints: ColorPoint[] = [];

  // RGB色空間の場合、rXYZ, gXYZ, bXYZ, wtptタグから色域を抽出
  if (header.colorSpace === 'RGB') {
    const redTag = findTag(arrayBuffer, 'rXYZ');
    const greenTag = findTag(arrayBuffer, 'gXYZ');
    const blueTag = findTag(arrayBuffer, 'bXYZ');
    const whiteTag = findTag(arrayBuffer, 'wtpt');

    if (redTag && greenTag && blueTag && whiteTag) {
      const redXYZ = readXYZ(arrayBuffer, redTag.offset);
      const greenXYZ = readXYZ(arrayBuffer, greenTag.offset);
      const blueXYZ = readXYZ(arrayBuffer, blueTag.offset);
      const whiteXYZ = readXYZ(arrayBuffer, whiteTag.offset);

      colorPoints = generateRGBGamut(redXYZ, greenXYZ, blueXYZ, whiteXYZ);
    } else {
      // タグが見つからない場合はsRGBのデフォルト値を使用
      console.warn('RGB primaries not found, using sRGB defaults');
      colorPoints = generateDefaultSRGBGamut();
    }
  } else {
    // RGB以外の色空間の場合はデフォルト
    console.warn(`Color space ${header.colorSpace} not fully supported yet`);
    colorPoints = generateDefaultSRGBGamut();
  }

  // 色域体積を計算
  const gamutVolume = calculateGamutVolume(colorPoints);

  return {
    header,
    colorPoints,
    gamutVolume,
    description,
  };
}

/**
 * デフォルトsRGB色域を生成
 */
function generateDefaultSRGBGamut(): ColorPoint[] {
  // sRGB primaries in XYZ
  const redXYZ = { x: 0.4124, y: 0.2126, z: 0.0193 };
  const greenXYZ = { x: 0.3576, y: 0.7152, z: 0.1192 };
  const blueXYZ = { x: 0.1805, y: 0.0722, z: 0.9505 };
  const whiteXYZ = { x: 0.9505, y: 1.0000, z: 1.0890 }; // D65

  return generateRGBGamut(redXYZ, greenXYZ, blueXYZ, whiteXYZ);
}

/**
 * RGB色域の体積を計算（四面体の体積）
 *
 * RGB色域は、原点(Black)と3つのプライマリ(R,G,B)で構成される四面体として近似
 */
function calculateGamutVolume(points: ColorPoint[]): number {
  if (points.length < 8) return 0;

  const black = points[7]; // Black point
  const red = points[0];
  const green = points[1];
  const blue = points[2];

  // 四面体の体積 = |det(v1, v2, v3)| / 6
  // v1 = R - Black, v2 = G - Black, v3 = B - Black

  const v1 = { x: red.x - black.x, y: red.y - black.y, z: red.z - black.z };
  const v2 = { x: green.x - black.x, y: green.y - black.y, z: green.z - black.z };
  const v3 = { x: blue.x - black.x, y: blue.y - black.y, z: blue.z - black.z };

  // 行列式（スカラー三重積）
  const det =
    v1.x * (v2.y * v3.z - v2.z * v3.y) -
    v1.y * (v2.x * v3.z - v2.z * v3.x) +
    v1.z * (v2.x * v3.y - v2.y * v3.x);

  return Math.abs(det) / 6;
}
