// src/components/ads/adsInPostEngine.ts
import type { AdItem } from "../../types/ads";

const MAX_ADS = 12;

export function applyAdsInPost(
  document: Document,
  ads: AdItem[] = []
) {
  if (!ads.length) return;

  let pIndex = 0;
  let slotIndex = 2;

  const paragraphs = Array.from(
    document.querySelectorAll("p")
  ).filter(p =>
    !p.closest("table, ul, ol, blockquote")
  );

  for (const p of paragraphs) {
    pIndex++;

    // ⛔ Bỏ 2 đoạn đầu cho nội dung mượt
    if (pIndex < 3) continue;
    if (pIndex === 6) continue;

    // ✅ Sau mỗi 2 <p> thì chèn 1 ads
    if ((pIndex - 2) % 2 !== 0) continue;

    if (slotIndex > MAX_ADS) break;

    const slot = document.createElement("div");
    slot.className = "ad-in-post";

    // 🔥 DIV ĐÍCH – NETWORK TỰ BƠM IFRAME
    slot.id = `div_adsconex_banner_responsive_${slotIndex}`;

    p.after(slot);
    slotIndex++;
  }
}
