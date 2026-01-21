export function lazyLoadAds() {
  if (typeof window === "undefined") return;
  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const slot = entry.target as HTMLElement;
        if (slot.dataset.loaded === "1") {
          observer.unobserve(slot);
          return;
        }
        slot.dataset.loaded = "1";

        // Reserve space – CLS safe
        if (!slot.style.minHeight) {
          slot.style.minHeight = "min(250px, 30vh)";
        }

        // Trigger network (NO script inject)
        const w = window as any;
        if (w.adsconex?.cmd) {
          w.adsconex.cmd.push(() => {
            w.adsconex.run?.();
          });
        }

        // Fail detect – safe
        setTimeout(() => {
          const iframe = slot.querySelector("iframe");
          if (!iframe || iframe.offsetHeight < 50) {
            slot.style.display = "none";
          }
        }, 4000);

        observer.unobserve(slot);
      });
    },
    {
      rootMargin: "400px 0px",
      threshold: 0.01,
    }
  );

  document
    .querySelectorAll<HTMLElement>(".ad-in-post[id]")
    .forEach((slot) => observer.observe(slot));
}

/* ===== START AFTER LCP ===== */
function runLazyAds() {
  if ("requestIdleCallback" in window) {
    requestIdleCallback(lazyLoadAds, { timeout: 2000 });
  } else {
    window.addEventListener("load", lazyLoadAds);
  }
}

runLazyAds();
