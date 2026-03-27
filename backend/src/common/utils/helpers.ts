import * as bcrypt from 'bcryptjs';

/** Hash password với bcrypt (cost factor 12) */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

/** So sánh password plaintext với hash */
export async function comparePassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Tính khoảng cách giữa 2 tọa độ GPS (Haversine formula).
 * @returns Khoảng cách tính bằng mét
 */
export function gpsDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000; // bán kính Trái Đất (mét)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Tạo mã QR string ngẫu nhiên dạng: STORE-{uuid8} */
export function generateQrCode(storeId: string): string {
  const short = storeId.replace(/-/g, '').substring(0, 8).toUpperCase();
  return `STORE-${short}`;
}

/** Loại bỏ field nhạy cảm khỏi object user */
export function sanitizeUser<T extends { passwordHash?: string }>(user: T): Omit<T, 'passwordHash'> {
  const { passwordHash, ...safe } = user;
  return safe;
}
