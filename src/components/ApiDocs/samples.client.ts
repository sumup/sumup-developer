import { initTabs, mount, writeUrlParam } from "@cloudflare/nimbus-docs/client";

const STORAGE_KEY = "nb-api-code-rail__lang";

export function initSamples(root: HTMLElement): () => void {
  const select = root.querySelector<HTMLSelectElement>(
    "[data-api-sample-select]",
  );
  const panels = [...root.querySelectorAll<HTMLElement>("[data-api-sample]")];
  if (!select || !panels.length) return () => {};
  const find = (value: string) =>
    panels.find((panel) => panel.dataset.apiSample === value) ??
    panels.find(
      (panel) =>
        panel.dataset.apiLanguage?.toLowerCase() === value.toLowerCase(),
    );
  const show = (panel: HTMLElement | undefined) => {
    if (!panel) return;
    panels.forEach((item) => {
      item.hidden = item !== panel;
    });
    select.value = panel.dataset.apiSample ?? "";
  };
  // Keep the server/inline selection; deferred setup only adds interactions.
  show(find(select.value) ?? panels[0]);
  select.disabled = false;
  select.closest("[data-disabled]")?.removeAttribute("data-disabled");
  root.setAttribute("data-api-samples-ready", "");
  const change = () => {
    const panel = find(select.value);
    show(panel);
    if (!panel) return;
    try {
      localStorage.setItem(STORAGE_KEY, panel.dataset.apiLanguage ?? "");
    } catch {
      /* Storage is optional. */
    }
    writeUrlParam("lang", select.value);
  };
  const storage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY && event.newValue) show(find(event.newValue));
  };
  select.addEventListener("change", change);
  window.addEventListener("storage", storage);
  return () => {
    select.removeEventListener("change", change);
    window.removeEventListener("storage", storage);
  };
}
mount("[data-api-samples]", initSamples);

export function initResponseSamples(root: HTMLElement): () => void {
  root
    .querySelectorAll<HTMLButtonElement>("[data-api-response-trigger]")
    .forEach((button) => {
      button.disabled = false;
    });
  const tabs = initTabs({
    container: root,
    tabSelector: "[data-api-response-trigger]",
    panelSelector: "[data-api-response-panel]",
  });
  root.setAttribute("data-api-response-ready", "");
  return () => tabs.destroy();
}

mount("[data-api-response-samples]", initResponseSamples);
