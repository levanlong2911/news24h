import type { APIRoute } from "astro";

const API_KEY  = import.meta.env.API_KEY ?? "";
const API_BASE = (import.meta.env.PUBLIC_API_BASE ?? "").replace(/\/$/, "");

export const GET: APIRoute = async ({ url }) => {
  const pageParam = url.searchParams.get("page") ?? "1";
  const domain    = url.searchParams.get("domain") ?? "";

  const page = parseInt(pageParam, 10);
  if (isNaN(page) || page < 1 || page > 500) {
    return json({ success: false, error: "Invalid page" }, 400);
  }

  // chỉ cho phép ký tự hợp lệ trong hostname
  const safeDomain = domain.replace(/[^a-zA-Z0-9.\-]/g, "");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);

  try {
    const res = await fetch(
      `${API_BASE}/posts?domain=${encodeURIComponent(safeDomain)}&page=${page}`,
      {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "X-Api-Key": API_KEY,
        },
      }
    );

    const data = await res.json();
    return json(data, res.status);
  } catch (e) {
    const isTimeout = e instanceof Error && e.name === "AbortError";
    console.error(`[api/posts] ${isTimeout ? "timeout" : "upstream error"} page=${page}`, e);
    return json({ success: false, error: isTimeout ? "Upstream timeout" : "Upstream error" }, 502);
  } finally {
    clearTimeout(timer);
  }
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
