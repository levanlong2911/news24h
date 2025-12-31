const memoryCache = new Map<string, any>();
const inFlight = new Map<string, Promise<any>>();

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
  fallback: T
): Promise<T> {
  // 1️⃣ Có cache → trả luôn
  if (memoryCache.has(url)) {
    return memoryCache.get(url);
  }

  // 2️⃣ Đang fetch → dùng chung promise
  if (inFlight.has(url)) {
    return inFlight.get(url)!;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  const fetchPromise = (async () => {
    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          ...(options.headers || {}),
        },
      });

      if (!res.ok) {
        console.error('[API ERROR]', res.status, url);
        return memoryCache.get(url) ?? fallback;
      }

      const json = await res.json();

      if (json?.success === false) {
        console.warn('[API FAIL]', json.message);
        return memoryCache.get(url) ?? fallback;
      }

      const data = json?.data ?? fallback;

      // 3️⃣ Chỉ cache khi data hợp lệ
      if (data !== fallback) {
        memoryCache.set(url, data);
      }

      return data;
    } catch (err) {
      console.error('[FETCH FAIL]', url, err);
      return memoryCache.get(url) ?? fallback;
    } finally {
      clearTimeout(timeout);
      inFlight.delete(url);
    }
  })();

  inFlight.set(url, fetchPromise);

  return fetchPromise;
}
