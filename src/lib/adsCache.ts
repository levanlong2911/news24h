// src/lib/adsCache.ts
import type { AdsMap, AdsPosition, AdItem } from '../types/ads';

const API_BASE = import.meta.env.PUBLIC_API_BASE;
const DEFAULT_TTL = 5 * 60 * 1000; // 5 phút

// cache dạng { data: AdsMap, expires: timestamp }
let adsCache: { data: AdsMap; expires: number } | null = null;

const positions: AdsPosition[] = ['header', 'top', 'middle', 'bottom', 'in-post'];

/**
 * Fetch tất cả ads từ API và cache.
 */
export async function getAllAds(ttl = DEFAULT_TTL): Promise<AdsMap> {
  const now = Date.now();

  // trả về cache nếu còn hiệu lực
  if (adsCache && adsCache.expires > now) {
    return adsCache.data;
  }

  const result: AdsMap = {};

  try {
    // fetch từng vị trí 1 lần
    await Promise.all(
      positions.map(async (pos) => {
        try {
          const res = await fetch(`${API_BASE}/ads?position=${pos}`);
          if (res.ok) {
            const json = await res.json();
            result[pos] = json.data || [];
          } else {
            console.warn(`Failed to fetch ads for ${pos}: HTTP ${res.status}`);
            result[pos] = [];
          }
        } catch (err) {
          console.error(`Failed to fetch ads for ${pos}:`, err);
          result[pos] = [];
        }
      })
    );

    // cache toàn bộ
    adsCache = { data: result, expires: now + ttl };
    return result;
  } catch (err) {
    console.error('Failed to fetch ads:', err);
    return adsCache?.data || {};
  }
}

/**
 * Lấy ads theo position, tự động fetch nếu cần.
 */
export async function getAdsByPosition(
  position: AdsPosition,
  ttl = DEFAULT_TTL
): Promise<AdItem[]> {
  const allAds = await getAllAds(ttl);
  return allAds[position] || [];
}
