import { apiFetch } from "./api";

export type AdsMap = Record<string, any[]>;

const ADS_API = "${API_BASE}/api/ads";

export async function useAds(): Promise<AdsMap> {
  return apiFetch<AdsMap>(
    ADS_API,
    {},
    {} // fallback = object rỗng
  );
}
