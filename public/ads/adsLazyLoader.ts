type AdStatus = "pending" | "active" | "failed";

export function watchAdsDOM({
  timeout = 4000,
  minHeight = 40
} = {}) {
  const slots = document.querySelectorAll<HTMLElement>(
    ".ad-in-post[data-ad-slot]"
  );

  slots.forEach(slot => {
    let status: AdStatus = "pending";

    const checkVisible = () => {
      const rect = slot.getBoundingClientRect();
      const height = rect.height;

      // iframe hoặc div con có height thật
      if (height >= minHeight) {
        status = "active";
        slot.dataset.adStatus = "active";
        observer.disconnect();
        clearTimeout(timer);
      }
    };

    const observer = new MutationObserver(checkVisible);
    observer.observe(slot, {
      childList: true,
      subtree: true,
      attributes: true
    });

    const timer = setTimeout(() => {
      if (status === "pending") {
        status = "failed";
        slot.dataset.adStatus = "failed";
        slot.remove(); // hoặc fallback
        observer.disconnect();
      }
    }, timeout);

    // initial check
    requestAnimationFrame(checkVisible);
  });
}
