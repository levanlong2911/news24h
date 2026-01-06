import type { AdsMap, AdItem, AdsPosition } from "../types/ads";

const API_BASE = import.meta.env.PUBLIC_API_BASE;

/**
 * GET /api/ads
 * dùng cho header | top | middle | bottom
 */
export async function fetchAllAds(): Promise<AdsMap> {
  const res = await fetch(`${API_BASE}/ads`);
  if (!res.ok) return {
    header: [],
    top: [],
    middle: [],
    bottom: [],
    'in-post': [],
  };

  const json = await res.json();
  return json.data || {};
}

/**
 * GET /api/ads/{position}
 * dùng riêng cho in-post
 */
export async function fetchAdsByPosition(
  position: AdsPosition
): Promise<AdItem[]> {
  try {
    const res = await fetch(`${API_BASE}/ads/${position}`);
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : [];
  } catch (e) {
    console.error(`fetchAdsByPosition(${position}) error:`, e);
    return [];
  }
}
