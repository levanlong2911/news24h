export function splitParagraphsWithAds(html: string, adsHtml: string[], interval = 3) {
  const regex = /<p[\s\S]*?<\/p>/gi;
  const paragraphs = html.match(regex) || [];
  const result: { type: 'p' | 'ad'; content: string }[] = [];

  paragraphs.forEach((p, index) => {
    result.push({ type: 'p', content: p });

    if ((index + 1) % interval === 0) {
      const adIndex = Math.floor(index / interval) % adsHtml.length;
      const adHtml = adsHtml[adIndex];
      result.push({ type: 'ad', content: adHtml });
    }
  });

  return result;
}
