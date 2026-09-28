import { mount } from "@cloudflare/nimbus-docs/client";

const storageKey = "portal-sidebar-groups";

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

  return () => controller.abort();
}

mount("[data-sidebar-persist]", initSidebarPersistence);
