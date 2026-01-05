import { apiFetch } from "./api";

export type AdsMap = Record<string, any[]>;
const ADS_URL = import.meta.env.PUBLIC_API_WEB

const ADS_API = "${ADS_URL}/ads";

export async function useAds(): Promise<AdsMap> {
  return apiFetch<AdsMap>(
    ADS_API,
    {},
    {} // fallback = object rỗng
  );
}
