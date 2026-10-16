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
