// src/components/ads/adsInPostEngine.ts
import type { AdItem } from "../../types/ads";

/**
 * SSR-safe HTML → DocumentFragment
 */
function htmlToFragment(document: Document, html: string) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content;
}

export function applyAdsInPost(
  document: Document,
  ads: AdItem[] = []
) {
  if (!ads || !ads.length) return;

  let paragraphs: Element[] = [];

  try {
    paragraphs = Array.from(
      document.querySelectorAll("p")
    ).filter(p => !p.closest("table, ul, ol, blockquote"));
  } catch {
    return; // guard cho SSR lỗi DOM
  }

  if (!paragraphs.length) return;

  /* =========================
     CASE 2: <ins class="aso-zone">
  ========================= */
  if (
    ads.length === 1 &&
    typeof ads[0]?.script === "string" &&
    ads[0].script.includes("<ins") &&
    ads[0].script.includes("aso-zone")
  ) {
    let count = 0;

    for (const p of paragraphs) {
      count++;
      if (count % 3 !== 0) continue;

      try {
        p.after(htmlToFragment(document, ads[0].script));
      } catch {
        // không bao giờ để SSR chết
      }
    }
    return;
  }

  /* =========================
     CASE 1: ADSCONEX
  ========================= */

  const inPost1 = ads.find(a =>
    typeof a.script === "string" &&
    a.script.includes("div_adsconex_banner_responsive")
  );

  const inPost2 = ads.find(a =>
    typeof a.script === "string" &&
    a.script.includes("js_adsconex_parallax_1")
  );

  const inPost3 = ads.find(a =>
    typeof a.script === "string" &&
    a.script.includes("js_adsconex_parallax_2")
  );

  let bannerIndex = 1;

  paragraphs.forEach((p, index) => {
    const pNum = index + 1;

    try {
      // 🔹 in-post 2 → sau p3
      if (pNum === 3 && inPost2) {
        p.after(htmlToFragment(document, inPost2.script));
      }

      // 🔹 in-post 3 → sau p7
      if (pNum === 7 && inPost3) {
        p.after(htmlToFragment(document, inPost3.script));
      }

      if (!inPost1) return;

      // 🔹 sau p5, p9
      if (pNum === 5 || pNum === 9) {
        const html = inPost1.script.replace(
          /div_adsconex_banner_responsive_\d+/,
          `div_adsconex_banner_responsive_${bannerIndex++}`
        );

        p.after(htmlToFragment(document, html));
        return;
      }

      // 🔹 sau p9 → mỗi 2 p
      if (pNum > 9 && (pNum - 9) % 2 === 0) {
        const html = inPost1.script.replace(
          /div_adsconex_banner_responsive_\d+/,
          `div_adsconex_banner_responsive_${bannerIndex++}`
        );

        p.after(htmlToFragment(document, html));
      }
    } catch {
      // tuyệt đối không throw
    }
  });
}
