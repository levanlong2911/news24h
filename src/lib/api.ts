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
  cfg: FetchOptions = {}
): Promise<T> {
  const url = buildURL(path);

  const ttl = cfg.ttl ?? 60_000;
  const stale = cfg.stale ?? 300_000;
  const timeoutMs = cfg.timeout ?? 6_000;

  const now = Date.now();
  const cached = memoryCache.get(url);

  // ✅ cache còn hạn
  if (cached && cached.expire > now) {
    return cached.data as T;
  }

  // ✅ cache stale
  if (cached && cached.staleUntil > now) {
    void safeRevalidate(url, options, fallback, ttl, stale, timeoutMs);
    return cached.data as T;
  }

  // ✅ chống duplicate request
  if (inFlight.has(url)) {
    return inFlight.get(url)!;
  }

  const promise = safeRevalidate(
    url,
    options,
    fallback,
    ttl,
    stale,
    timeoutMs
  );

  inFlight.set(url, promise);

  // ⚠️ đảm bảo xóa inFlight dù promise lỗi
  promise.finally(() => {
    inFlight.delete(url);
  });

  return promise;
}

async function safeRevalidate<T>(
  url: string,
  options: RequestInit,
  fallback: T,
  ttl: number,
  stale: number,
  timeoutMs: number
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

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

    if (!res.ok) throw new Error("Bad response");

    const json = await res.json();

    // ❗ PROMAX: không tin API
    if (!json || json.success !== true) {
      throw new Error("Invalid API payload");
    }

    const data = (json.data ?? fallback) as T;

    memoryCache.set(url, {
      data,
      expire: Date.now() + ttl,
      staleUntil: Date.now() + stale,
    });

    return data;
  } catch {
    const cached = memoryCache.get(url);
    return (cached?.data ?? fallback) as T;
  } finally {
    clearTimeout(timer);
  }
}


export const fetchPosts = async () => {
  const res = await apiFetch<any>(
    "posts",
    {},
    [],
    { ttl: 30_000, stale: 180_000 }
  );

  // PROMAX UNWRAP
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;

  return [];
};


export const fetchPostDetail = async (slug: string) => {
  const res = await apiFetch<any>(
    `posts/${slug}`,
    {},
    { post: null, related_posts: [] },
    { ttl: 120_000, stale: 600_000 }
  );

  return res?.post ? res : null;
};

export const fetchAds = () =>
  apiFetch<AdsMap>(
    "ads",
    {},
    {},
    { ttl: 300_000, stale: 1_800_000 }
  );
