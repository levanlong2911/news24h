export function injectAdScript(container: HTMLElement, raw: string) {
  if (!raw || !raw.includes("<script")) return;

  const temp = document.createElement("div");
  temp.innerHTML = raw;

  [...temp.childNodes].forEach((node) => {
    if (node.nodeName === "SCRIPT") {
      const s = document.createElement("script");
      [...node.attributes].forEach((a) =>
        s.setAttribute(a.name, a.value)
      );
      s.textContent = node.textContent;
      container.appendChild(s);
    } else {
      container.appendChild(node.cloneNode(true));
    }
  });
}
