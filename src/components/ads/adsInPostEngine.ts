import type { AdItem } from "../../types/ads";

const MAX_ADS = 18;

export function applyAdsInPost(
  document: Document,
  ads: AdItem[] = []
) {
  // Không có ads → không chèn
  if (!Array.isArray(ads) || !ads.length) return;

  let pIndex = 0;
  let slotIndex = 2;

  const paragraphs = Array.from(
    document.querySelectorAll("p")
  ).filter(p =>
    !p.closest("table, ul, ol, blockquote")
  );

  for (const p of paragraphs) {
    pIndex++;

    // chỉ bắt đầu từ p3
    if (pIndex < 3) continue;

    // bỏ p6
    if (pIndex === 6) continue;

    if (slotIndex > MAX_ADS) break;

    const slot = document.createElement("div");
    slot.className = "ad-in-post";
    slot.dataset.adSlot =
      `div_adsconex_banner_responsive_${slotIndex}`;

    slotIndex++;
    p.after(slot);
  }
}
