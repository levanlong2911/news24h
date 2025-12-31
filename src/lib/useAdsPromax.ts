import { apiFetch } from "./api";

export type AdsMap = Record<string, any[]>;

const ADS_API = "https://admin.lifennew.com/api/ads";

// Detect bot (SSR-safe)
function isBot(ua = "") {
  return /googlebot|bingbot|yandex|duckduckbot|baiduspider/i.test(ua);
}

export async function useAdsPromax(Astro: any): Promise<AdsMap> {
  const ua =
    Astro?.request?.headers.get("user-agent") || "";

  // 🤖 Googlebot → NO ADS (SEO CLEAN)
  if (isBot(ua)) {
    return {};
  }

  // 🔥 Normal user
  return apiFetch<AdsMap>(
    ADS_API,
    {
      headers: {
        "X-ADS-MODE": "promax",
      },
    },
    {} // fallback tuyệt đối
  );
}
