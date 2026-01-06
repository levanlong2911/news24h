// src/utils/injectAdsByParagraph.ts
import { JSDOM } from "jsdom";

export function injectAdsByParagraph(html: string): string {
  const dom = new JSDOM(`<body>${html}</body>`);
  const document = dom.window.document;

  const paragraphs = Array.from(document.querySelectorAll("p"));

  let pIndex = 0;
  let bannerIndex = 2;
  const MAX_BANNER = 18;

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];

    // ❌ BỎ QUA <p> NẰM TRONG TABLE
    if (p.closest("table")) continue;

    pIndex++;

    // chỉ chèn nếu còn p phía sau
    const hasNextParagraph =
      paragraphs.slice(i + 1).some(p2 => !p2.closest("table"));
    if (!hasNextParagraph) break;

    // p2 → Inpage 1
    if (pIndex === 2) {
      insertAfter(p, getInpage(1, document));
    }

    // p3–5 → banner 2–4
    else if (pIndex >= 3 && pIndex <= 5 && bannerIndex <= MAX_BANNER) {
      insertAfter(p, getBanner(bannerIndex++, document));
    }

    // p6 → Inpage 2
    else if (pIndex === 6) {
      insertAfter(p, getInpage(2, document));
    }

    // p7+ → banner tiếp
    else if (pIndex >= 7 && bannerIndex <= MAX_BANNER) {
      insertAfter(p, getBanner(bannerIndex++, document));
    }
  }

  return document.body.innerHTML;
}

/* ---------------- helpers ---------------- */

function insertAfter(target: Element, node: Element) {
  target.parentNode?.insertBefore(node, target.nextSibling);
}

function getBanner(n: number, doc: Document) {
  const wrap = doc.createElement("div");
  wrap.className = "ads ads-banner";
  wrap.innerHTML = `<div id="div_adsconex_banner_responsive_${n}"></div>`;
  return wrap;
}

function getInpage(n: number, doc: Document) {
  const wrap = doc.createElement("div");
  wrap.innerHTML = `
<div id="js_adsconex_parallax_${n}" data-type="parallax">
  <div class="adsconex-parallax_wrapper" style="display: block;">
    <div class="adsconex-parallax_ad-wrapper">
      <div class="adsconex-parallax_ad" align="center">
        <div id="div_adsconex_inpage_${n}"></div>
      </div>
    </div>
  </div>
</div>
`;
  return wrap;
}
