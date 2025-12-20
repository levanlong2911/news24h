export type ContentPart =
  | { type: 'html'; content: string }
  | { type: 'ad'; content: string };

export function splitParagraphsWithAds(
  html: string,
  adsHtml: string[],
  interval = 3
): ContentPart[] {
  if (!html) return [];

  const result: ContentPart[] = [];

  // Tách HTML theo <p>...</p> nhưng giữ lại phần khác
  const parts = html.split(/(<p[\s\S]*?<\/p>)/gi);

  let pCount = 0;
  let adIndex = 0;

  for (const part of parts) {
    if (!part) continue;

    if (/^<p[\s\S]*<\/p>$/i.test(part)) {
      // Là <p>
      result.push({ type: 'html', content: part });
      pCount++;

      if (
        pCount % interval === 0 &&
        adsHtml.length > 0 &&
        adIndex < adsHtml.length
      ) {
        result.push({
          type: 'ad',
          content: adsHtml[adIndex % adsHtml.length],
        });
        adIndex++;
      }
    } else {
      // Là H, table, ul, iframe, img, text...
      result.push({ type: 'html', content: part });
    }
  }

  return result;
}
