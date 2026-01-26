// src/components/ads/adsInPostEngine.ts
import type { AdItem } from "../../types/ads";

export function applyAdsInPost(
  document: Document,
  ads: AdItem[] = []
) {
  if (!ads.length) return;

  const paragraphs = Array.from(
    document.querySelectorAll("p")
  ).filter(p => !p.closest("table, ul, ol, blockquote"));

  /* =========================
     CASE 2: <ins class="aso-zone">
  ========================= */
  if (
    ads.length === 1 &&
    ads[0].script.includes("<ins") &&
    ads[0].script.includes("aso-zone")
  ) {
    let count = 0;

    for (const p of paragraphs) {
      count++;
      if (count % 3 !== 0) continue;

      p.after(
        document.createRange().createContextualFragment(ads[0].script)
      );
    }
    return;
  }

  /* =========================
     CASE 1: ADSCONEX
  ========================= */

  const inPost1 = ads.find(a =>
    a.script.includes("div_adsconex_banner_responsive")
  );
  const inPost2 = ads.find(a =>
    a.script.includes("js_adsconex_parallax_1")
  );
  const inPost3 = ads.find(a =>
    a.script.includes("js_adsconex_parallax_2")
  );

  let bannerIndex = 1;

  paragraphs.forEach((p, index) => {
    const pNum = index + 1;

    // 🔹 in-post 2 → sau p3
    if (pNum === 3 && inPost2) {
      p.after(
        document.createRange().createContextualFragment(inPost2.script)
      );
    }

    // 🔹 in-post 3 → sau p7
    if (pNum === 7 && inPost3) {
      p.after(
        document.createRange().createContextualFragment(inPost3.script)
      );
    }

    if (!inPost1) return;

    // 🔹 sau p5, p9
    if (pNum === 5 || pNum === 9) {
      const html = inPost1.script.replace(
        /div_adsconex_banner_responsive_\d+/,
        `div_adsconex_banner_responsive_${bannerIndex++}`
      );

      p.after(
        document.createRange().createContextualFragment(html)
      );
      return;
    }

    // 🔹 sau p9 → mỗi 2 p
    if (pNum > 9 && (pNum - 9) % 2 === 0) {
      const html = inPost1.script.replace(
        /div_adsconex_banner_responsive_\d+/,
        `div_adsconex_banner_responsive_${bannerIndex++}`
      );

      p.after(
        document.createRange().createContextualFragment(html)
      );
    }
  });
}
