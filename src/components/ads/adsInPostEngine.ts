import type { AdItem } from "../../types/ads";

function makeTemplate(document: Document, html: string): HTMLTemplateElement {
  const tpl = document.createElement("template");
  tpl.innerHTML = html.trim();
  return tpl;
}

function findAd(ads: AdItem[], marker: string): AdItem | null {
  return ads.find(a => typeof a.script === "string" && a.script.includes(marker)) ?? null;
}

export function applyAdsInPost(document: Document, ads: AdItem[] = []) {
  if (!ads.length) return;

  let paragraphs: Element[];
  try {
    paragraphs = Array.from(document.querySelectorAll("p"))
      .filter(p => !p.closest("table, ul, ol, blockquote"));
  } catch {
    return;
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
    // parse HTML 1 lần duy nhất, clone cho mỗi vị trí
    const tpl = makeTemplate(document, ads[0].script);
    let count = 0;
    for (const p of paragraphs) {
      if (++count % 3 !== 0) continue;
      try {
        p.after(tpl.content.cloneNode(true));
      } catch (e) {
        console.error("[ads] inject aso-zone failed", e);
      }
    }
    return;
  }

  /* =========================
     CASE 1: ADSCONEX
  ========================= */
  const inPost1 = findAd(ads, "div_adsconex_banner_responsive");
  const inPost2 = findAd(ads, "js_adsconex_parallax_1");
  const inPost3 = findAd(ads, "js_adsconex_parallax_2");

  // parse static ads 1 lần
  const tpl2 = inPost2 ? makeTemplate(document, inPost2.script) : null;
  const tpl3 = inPost3 ? makeTemplate(document, inPost3.script) : null;

  let bannerIndex = 1;

  paragraphs.forEach((p, index) => {
    const pNum = index + 1;
    try {
      if (pNum === 2 && tpl2) p.after(tpl2.content.cloneNode(true));
      if (pNum === 7 && tpl3) p.after(tpl3.content.cloneNode(true));

      if (!inPost1) return;

      if (pNum >= 3 && pNum !== 7) {
        const html = inPost1.script.replace(
          /div_adsconex_banner_responsive_\d+/g,
          `div_adsconex_banner_responsive_${bannerIndex++}`
        );
        p.after(makeTemplate(document, html).content);
      }
    } catch (e) {
      console.error("[ads] inject in-post failed at p" + pNum, e);
    }
  });
}
