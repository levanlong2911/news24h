import type { AdsMap } from "../types/ads";

const memoryCache = new Map<string, any>();
const inFlight = new Map<string, Promise<any>>();

const API_KEY = import.meta.env.PUBLIC_API_KEY;
const API_BASE = import.meta.env.PUBLIC_API_BASE.replace(/\/$/, "");
const WEB_BASE = import.meta.env.PUBLIC_API_WEB.replace(/\/$/, "");

function buildURL(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return `${API_BASE}/${path.replace(/^\/+/, "")}`;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  fallback: T,
  ttl = 60_000
): Promise<T> {
  const url = buildURL(path);

  const cached = memoryCache.get(url);
  if (cached && cached.expire > Date.now()) {
    return cached.data;
  }

  if (inFlight.has(url)) {
    return inFlight.get(url)!;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  const promise = (async () => {
    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "X-Api-Key": API_KEY,
          ...(options.headers || {}),
        },
      });

      if (!res.ok) return fallback;

      const json = await res.json();
      if (json?.success === false) return fallback;

      const data = json?.data ?? fallback;

      memoryCache.set(url, {
        data,
        expire: Date.now() + ttl,
      });

      return data;
    } catch {
      return fallback;
    } finally {
      clearTimeout(timeout);
      inFlight.delete(url);
    }
  })();

  inFlight.set(url, promise);
  return promise;
}

/* ========= HELPERS ========= */

export const fetchPosts = async () => {
  const res = await apiFetch<any>("posts", {}, null);

  // 🔥 DEBUG nếu cần
  console.log("fetchPosts raw:", res);

  // ✅ UNWRAP LARAVEL PAGINATOR
  return Array.isArray(res?.data)
    ? res.data
    : [];
};

export const fetchPostDetail = (slug: string) =>
  apiFetch(`posts/${slug}`, {}, null);

export const fetchAds = () =>
  apiFetch<AdsMap>("ads", {}, {});

export const webLink = (path = "") =>
  `${WEB_BASE}/${path.replace(/^\/+/, "")}`;
