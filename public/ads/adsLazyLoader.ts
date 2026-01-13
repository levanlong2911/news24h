export function lazyLoadAds() {
  if (typeof window === "undefined") return;
  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const slot = entry.target as HTMLElement;

        // ⛔ tránh chạy lại nhiều lần
        if (slot.dataset.loaded === "1") {
          observer.unobserve(slot);
          return;
        }
        slot.dataset.loaded = "1";

        /* =========================
           1️⃣ RESERVE SPACE (CLS)
        ========================= */
        if (!slot.style.minHeight) {
          slot.style.minHeight = "250px";
        }

        /* =========================
           2️⃣ TRIGGER ADS NETWORK
           (KHÔNG inject script)
        ========================= */
        const w = window as any;

        if (w.adsconex?.cmd) {
          w.adsconex.cmd.push(() => {
            // run() không cần param → scan DOM theo ID
            w.adsconex.run?.();
          });
        }

        /* =========================
           3️⃣ FAIL DETECT (REAL)
           → kiểm tra iframe bên trong
        ========================= */
        setTimeout(() => {
          const iframe = slot.querySelector("iframe");

          // iframe không tồn tại hoặc cao < 50px → FAIL
          if (!iframe || iframe.offsetHeight < 50) {
            slot.remove();
          }
        }, 2500);

        observer.unobserve(slot);
      });
    },
    {
      rootMargin: "300px 0px",
      threshold: 0.01,
    }
  );

  /* =========================
     OBSERVE ALL IN-POST SLOTS
  ========================= */
  document
    .querySelectorAll<HTMLElement>(".ad-in-post[id]")
    .forEach((slot) => observer.observe(slot));
}

/* =========================
   AUTO RUN
========================= */
lazyLoadAds();
