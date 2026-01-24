// src/components/ads/adsInPostEngine.ts
import type { AdItem } from "../../types/ads";

export function applyAdsInPost(
  document: Document,
  ads: AdItem[] = []
) {
  if (!ads.length) return;

  const paragraphs = Array.from(
    document.querySelectorAll("p")
  ).filter(p =>
    !p.closest("table, ul, ol, blockquote")
  );

  // =========================
  // CASE 2: <ins class="aso-zone">
  // =========================
  const isCase2 = ads.length === 1 && ads[0].script.includes("<ins");

  if (isCase2) {
    let count = 0;

    for (let i = 0; i < paragraphs.length; i++) {
      count++;

      if (count % 3 !== 0) continue;

      const frag = document.createRange().createContextualFragment(
        ads[0].script
      );

      paragraphs[i].after(frag);
    }

    return;
  }

  // =========================
  // CASE 1: ADSCONEX
  // =========================

  const inPost1 = ads.find(a => a.name === "in-post 1");
  const inPost2 = ads.find(a => a.name === "in-post 2");
  const inPost3 = ads.find(a => a.name === "in-post 3");

  let bannerIndex = 1;

  paragraphs.forEach((p, index) => {
    const pNum = index + 1;

    // 🔹 in-post 2 & 3
    if (pNum === 3 && inPost2) {
      p.after(
        document.createRange().createContextualFragment(inPost2.script)
      );
    }

    if (pNum === 7 && inPost3) {
      p.after(
        document.createRange().createContextualFragment(inPost3.script)
      );
    }

    // 🔹 in-post 1
    if (!inPost1) return;

    // Sau p5, p9
    if (pNum === 5 || pNum === 9) {
      const html = inPost1.script.replace(
        /div_adsconex_banner_responsive_\d+/,
        `div_adsconex_banner_responsive_${bannerIndex++}`
      );

      p.after(document.createRange().createContextualFragment(html));
      return;
    }

    // Sau p9 → mỗi 2 p chèn tiếp
    if (pNum > 9 && (pNum - 9) % 2 === 0) {
      const html = inPost1.script.replace(
        /div_adsconex_banner_responsive_\d+/,
        `div_adsconex_banner_responsive_${bannerIndex++}`
      );

      p.after(document.createRange().createContextualFragment(html));
    }
  });
}
