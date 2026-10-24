import { initNavSidebar, mount } from "@cloudflare/nimbus-docs/client";

export function initSidebarPersistence(root: HTMLElement) {
  // Filtering temporarily opens groups. Keep those toggle events out of the
  // upstream persistence helper, which also supports our native details markup.
  const suppressFilteredToggles = (event: Event) => {
    if (root.querySelector("[data-sidebar-filtering]"))
      event.stopImmediatePropagation();
  };
  root.addEventListener("toggle", suppressFilteredToggles, true);
  const destroy = initNavSidebar(root);
  return () => {
    destroy();
    root.removeEventListener("toggle", suppressFilteredToggles, true);
  };
}
mount("[data-nb-nav-state]", initSidebarPersistence);

export function initSidebarFilter(root: HTMLElement): () => void {
  const input = root.previousElementSibling?.querySelector<HTMLInputElement>(
    "[data-sidebar-filter]",
  );
  if (!input) return () => {};
  const initial = new Map<HTMLDetailsElement, boolean>();
  const filterList = (
    list: Element,
    query: string,
    inherited = false,
  ): boolean => {
    let any = false;
    for (const row of Array.from(list.children)) {
      const group = row.querySelector<HTMLDetailsElement>(":scope > details");
      const label =
        group?.querySelector("summary")?.textContent ?? row.textContent ?? "";
      const matches = inherited || label.toLowerCase().includes(query);
      const childList = group?.querySelector(":scope > ul");
      const childMatches = childList
        ? filterList(childList, query, matches)
        : false;
      const visible = !query || matches || childMatches;
      (row as HTMLElement).hidden = !visible;
      if (group && query && visible) group.open = true;
      any ||= visible;
    }
    return any;
  };
  const filter = () => {
    const query = input.value.trim().toLowerCase();
    if (query && !root.hasAttribute("data-sidebar-filtering")) {
      root
        .querySelectorAll<HTMLDetailsElement>("details")
        .forEach((group) => initial.set(group, group.open));
      root.setAttribute("data-sidebar-filtering", "");
    }
    filterList(root, query);
    if (!query) {
      initial.forEach((open, group) => {
        group.open = open;
      });
      initial.clear();
      // Toggle events run after this input event; keep temporary state out of persistence.
      requestAnimationFrame(() =>
        root.removeAttribute("data-sidebar-filtering"),
      );
    }
  };
  input.addEventListener("input", filter);
  return () => input.removeEventListener("input", filter);
}
mount("[data-sidebar-filterable]", initSidebarFilter);
