import type { AdsMap } from "../types/ads";

type FetchOptions = {
  ttl?: number;
  stale?: number;
  timeout?: number;
  version?: string;
};

const CACHE_MAX = 500;
const memoryCache = new Map<string, any>();
const inFlight = new Map<string, Promise<any>>();

function pruneCache() {
  if (memoryCache.size <= CACHE_MAX) return;
  const firstKey = memoryCache.keys().next().value;
  if (firstKey !== undefined) memoryCache.delete(firstKey);
}

const API_KEY  = import.meta.env.PUBLIC_API_KEY ?? "";
const API_BASE = (import.meta.env.PUBLIC_API_BASE ?? "").replace(/\/$/, "");

function buildURL(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return `${API_BASE}/${path.replace(/^\/+/, "")}`;
}

function buildCacheKey(url: string, version?: string) {
  return version ? `${url}::v=${version}` : url;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  fallback: T,
  cfg: FetchOptions = {}
): Promise<T> {
  const url = buildURL(path);
  const key = buildCacheKey(url, cfg.version);

  const ttl       = cfg.ttl ?? 60_000;
  const stale     = cfg.stale ?? 300_000;
  const timeoutMs = cfg.timeout ?? 6_000;

  const now    = Date.now();
  const cached = memoryCache.get(key);

  if (cached && cached.expire > now) {
    return cached.data as T;
  }

  if (cached && cached.staleUntil > now) {
    void safeRevalidate(key, url, options, fallback, ttl, stale, timeoutMs);
    return cached.data as T;
  }

  if (inFlight.has(key)) {
    return inFlight.get(key)!;
  }

  const promise = safeRevalidate(key, url, options, fallback, ttl, stale, timeoutMs);

  inFlight.set(key, promise);
  promise.finally(() => inFlight.delete(key));

  return promise;
}

async function safeRevalidate<T>(
  key: string,
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

    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} — ${url}`);

    const json = await res.json();

    if (!json || json.success !== true) {
      throw new Error(`Invalid API payload from ${url}`);
    }

    const data = (json.data ?? fallback) as T;

    memoryCache.set(key, {
      data,
      expire: Date.now() + ttl,
      staleUntil: Date.now() + stale,
    });
    pruneCache();

    return data;

  } catch (e) {
    const isTimeout = e instanceof Error && e.name === "AbortError";
    console.error(
      `[api] ${isTimeout ? "timeout" : "fetch error"}: ${url}`,
      e instanceof Error ? e.message : e
    );
    const cached = memoryCache.get(key);
    return (cached?.data ?? fallback) as T;
  } finally {
    clearTimeout(timer);
  }
}

export const fetchPosts = async (page = 1, version = "v1") => {
  const res = await apiFetch<any>(
    `posts?page=${page}`,
    {},
    { items: [], meta: null },
    { ttl: 30_000, stale: 180_000, version }
  );
  return {
    items: res?.items ?? [],
    meta: res?.meta ?? null,
  };
};

export const fetchPostDetail = async (slug: string, version = "v1") => {
  const res = await apiFetch<any>(
    `posts/${slug}`,
    {},
    null,
    { ttl: 120_000, stale: 600_000, version }
  );
  if (!res || !res.post) return null;
  return res;
};

export const fetchAds = () =>
  apiFetch<AdsMap>(
    "ads",
    {},
    {},
    { ttl: 300_000, stale: 1_800_000 }
  );
