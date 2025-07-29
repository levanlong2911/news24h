// src/lib/adsCache.ts
let adsCache: Record<string, any[]> = {};

export async function getAdsByPosition(position: string) {
  if (adsCache[position]) return adsCache[position];

  try {
    const res = await fetch(`https://admin.lifennew.com/api/ads?position=${position}`);
    if (res.ok) {
      const json = await res.json();
      adsCache[position] = json.data || [];
      return adsCache[position];
    }
  } catch (err) {
    console.error('Failed to fetch ads:', err);
  }

  adsCache[position] = []; // fallback
  return [];
}
