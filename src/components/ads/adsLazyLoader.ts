type AdsMap = Record<string, string>;

export function lazyLoadAds(
  adsMap: AdsMap,
  options?: {
    rootMargin?: string;
    maxConcurrent?: number;
    failTimeout?: number;
  }
) {
  if (!("IntersectionObserver" in window)) return;

  const rootMargin = options?.rootMargin ?? "300px 0px";
  const maxConcurrent = options?.maxConcurrent ?? 2;
  const failTimeout = options?.failTimeout ?? 2500;

  let loadingCount = 0;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (loadingCount >= maxConcurrent) return;

        const slot = entry.target as HTMLElement;
        const slotId = slot.dataset.adSlot;

        if (!slotId || slot.dataset.loaded === "1") {
          observer.unobserve(slot);
          return;
        }

        const adScript = adsMap[slotId];
        if (!adScript) {
          slot.remove();
          observer.unobserve(slot);
          return;
        }

        slot.dataset.loaded = "1";
        loadingCount++;

        // reserve space → giảm CLS
        slot.style.minHeight = "250px";

        const adNode = document.createElement("div");
        adNode.id = slotId;
        slot.appendChild(adNode);

        // inject script
        const script = document.createElement("script");
        script.innerHTML = adScript;
        slot.appendChild(script);

        // FAIL DETECT
        setTimeout(() => {
          const rect = adNode.getBoundingClientRect();
          const style = window.getComputedStyle(adNode);

          if (
            rect.width === 0 ||
            rect.height === 0 ||
            style.display === "none" ||
            style.visibility === "hidden"
          ) {
            slot.remove();
          }

          loadingCount--;
        }, failTimeout);

        observer.unobserve(slot);
      });
    },
    { rootMargin }
  );

  document
    .querySelectorAll<HTMLElement>(".ad-in-post[data-ad-slot]")
    .forEach(slot => observer.observe(slot));
}
