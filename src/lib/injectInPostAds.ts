import type { AdItem } from "../types/ads";

export type ContentPart =
  | { type: "html"; content: string }
  | { type: "ad"; content: string };

export function injectInPostAds(
  html: string,
  ads: AdItem[] = [],
  every = 3
): ContentPart[] {
  if (!html?.trim()) return [];

  const validAds = ads
    .map((a) => a.script)
    .filter((s) => s?.includes("<script"));

  if (!validAds.length) {
    return [{ type: "html", content: html }];
  }

  const parts = html.split(/(<\/p>)/i);
  const result: ContentPart[] = [];

  let adIndex = 0;
  let count = 0;

  for (let i = 0; i < parts.length; i += 2) {
    const chunk = (parts[i] || "") + (parts[i + 1] || "");
    if (!chunk.trim()) continue;

    result.push({ type: "html", content: chunk });
    count++;

    if (count % every === 0) {
      result.push({
        type: "ad",
        content: validAds[adIndex % validAds.length],
      });
      adIndex++;
    }
  }

  return result;
}
