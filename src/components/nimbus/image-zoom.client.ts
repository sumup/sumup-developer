import { mount } from "@cloudflare/nimbus-docs/client";

export function initImageZoom(dialog: HTMLDialogElement) {
  const enlarged = dialog.querySelector<HTMLImageElement>(
    "[data-image-zoom-image]",
  );
  if (!enlarged || !dialog.showModal) return () => {};
  const controller = new AbortController();
  const { signal } = controller;
  let trigger: HTMLImageElement | undefined;
  const images = Array.from(
    document.querySelectorAll<HTMLImageElement>(".docs-content img"),
  ).filter(
    (image) =>
      image.alt.trim() && !image.closest('a, button, [data-nb-zoom="off"]'),
  );
  const clearTrigger = (image: HTMLImageElement) => {
    for (const attribute of ["role", "tabindex", "aria-label"])
      image.removeAttribute(attribute);
  };
  const updateTrigger = (image: HTMLImageElement) => {
    if (dialog.open && trigger === image) return;
    const scale = Math.min(
      1,
      (window.innerWidth * 0.95 - 32) / image.naturalWidth,
      (window.innerHeight * 0.95 - 112) / image.naturalHeight,
    );
    // A full-width image on a phone may already be larger than the dialog.
    if (
      !image.clientWidth ||
      image.naturalWidth * scale < image.clientWidth * 1.2
    ) {
      clearTrigger(image);
      return;
    }
    image.setAttribute("role", "button");
    image.tabIndex = 0;
    image.setAttribute("aria-label", `Enlarge image: ${image.alt}`);
  };
  const updateTriggers = () => images.forEach(updateTrigger);

  const open = (image: HTMLImageElement) => {
    if (image.getAttribute("role") !== "button") return;
    trigger = image;
    enlarged.src = image.currentSrc || image.src;
    enlarged.alt = image.alt;
    dialog.setAttribute("aria-label", `Enlarged image: ${image.alt}`);
    dialog.showModal();
    dialog.querySelector<HTMLButtonElement>("button")?.focus();
  };
  for (const image of images) {
    updateTrigger(image);
    image.addEventListener("load", () => updateTrigger(image), { signal });
    image.addEventListener("click", () => open(image), { signal });
    image.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open(image);
        }
      },
      { signal },
    );
  }
  window.addEventListener("resize", updateTriggers, { signal });
  dialog.addEventListener(
    "click",
    (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      )
        dialog.close();
    },
    { signal },
  );
  dialog.addEventListener(
    "close",
    () => {
      trigger?.focus({ preventScroll: true });
      enlarged.removeAttribute("src");
      updateTriggers();
    },
    { signal },
  );
  return () => {
    if (dialog.open) dialog.close();
    controller.abort();
    for (const image of images) {
      clearTrigger(image);
    }
  };
}

mount("[data-image-zoom]", (root) =>
  root instanceof HTMLDialogElement ? initImageZoom(root) : () => {},
);
