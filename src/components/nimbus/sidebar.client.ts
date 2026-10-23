import { mount } from "@cloudflare/nimbus-docs/client";

const storageKey = "portal-sidebar-groups";
const scrollStorageKey = "portal-sidebar-scroll";

export function initSidebarPersistence(root: HTMLElement) {
  let state: Record<string, boolean> = {};
  try {
    const stored: unknown = JSON.parse(
      sessionStorage.getItem(storageKey) ?? "{}",
    );
    if (stored && typeof stored === "object" && !Array.isArray(stored)) {
      state = Object.fromEntries(
        Object.entries(stored).filter(
          ([, value]) => typeof value === "boolean",
        ),
      );
    }
  } catch {
    // Navigation remains functional when storage is unavailable.
  }

  const controller = new AbortController();
  const scrollHost = root.closest("nav");
  const signature = Array.from(root.querySelectorAll("a[href]"), (link) =>
    link.getAttribute("href"),
  ).join("\n");
  if (scrollHost) {
    try {
      const stored = JSON.parse(
        sessionStorage.getItem(scrollStorageKey) ?? "null",
      );
      if (stored?.signature === signature && Number.isFinite(stored.scroll)) {
        scrollHost.scrollTop = Math.max(0, stored.scroll);
      }
    } catch {
      // Fall back to showing the active page when storage is unavailable.
    }
  }
  root
    .querySelectorAll<HTMLDetailsElement>("[data-sidebar-group]")
    .forEach((group) => {
      const key = group.dataset.sidebarKey;
      if (!key) return;
      if (group.dataset.hasActive !== "true" && key in state)
        group.open = state[key];
      group.addEventListener(
        "toggle",
        () => {
          if (root.hasAttribute("data-sidebar-filtering")) return;
          state[key] = group.open;
          try {
            sessionStorage.setItem(storageKey, JSON.stringify(state));
          } catch {
            // Navigation remains functional when storage is unavailable.
          }
        },
        { signal: controller.signal },
      );
    });

  // Restore groups before measuring: opening the active group changes layout.
  const frame = requestAnimationFrame(() => {
    const active = root.querySelector<HTMLElement>('[aria-current="page"]');
    if (!scrollHost || !active || !scrollHost.clientHeight) return;
    const viewport = scrollHost.getBoundingClientRect();
    const bounds = active.getBoundingClientRect();
    if (bounds.top < viewport.top || bounds.bottom > viewport.bottom) {
      scrollHost.scrollTop +=
        bounds.top -
        viewport.top -
        (scrollHost.clientHeight - bounds.height) / 2;
    }
  });
  const saveScroll = () => {
    if (!scrollHost) return;
    try {
      sessionStorage.setItem(
        scrollStorageKey,
        JSON.stringify({ signature, scroll: scrollHost.scrollTop }),
      );
    } catch {
      // Navigation remains functional when storage is unavailable.
    }
  };
  let scrollFrame = 0;
  scrollHost?.addEventListener(
    "scroll",
    () => {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = requestAnimationFrame(saveScroll);
    },
    { signal: controller.signal },
  );
  window.addEventListener("pagehide", saveScroll, {
    signal: controller.signal,
  });

  return () => {
    saveScroll();
    cancelAnimationFrame(frame);
    cancelAnimationFrame(scrollFrame);
    controller.abort();
  };
}

mount("[data-sidebar-persist]", initSidebarPersistence);

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
