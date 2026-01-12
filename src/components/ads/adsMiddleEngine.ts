import type { AdItem } from "../../types/ads";

export function applyAdsMiddle(
  document: Document,
  ads: AdItem[] = []
) {
  if (!ads.length) return;

  const TARGET_P = [2, 6];
  let pIndex = 0;
  let cursor = 0;

  document.querySelectorAll("p").forEach(p => {
    if (p.closest("table, ul, ol, blockquote")) return;

    pIndex++;

    if (!TARGET_P.includes(pIndex)) return;
    if (!ads[cursor]) return;

    const wrapper = document.createElement("div");
    wrapper.className = "ad-middle";
    wrapper.innerHTML = ads[cursor++].script;

    p.after(wrapper);
  });
}
