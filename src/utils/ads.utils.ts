// src/utils/ads.utils.ts
export function extractScripts(adScript: string) {
  const headScripts: string[] = [];
  let bodyHtml = adScript;

  // 1. Lấy tất cả script (có và không có src)
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;

  bodyHtml = bodyHtml.replace(scriptRegex, (match) => {
    headScripts.push(match); // giữ nguyên toàn bộ thẻ <script>
    return ''; // loại khỏi bodyHtml
  });

  return { headScripts, bodyHtml };
}
