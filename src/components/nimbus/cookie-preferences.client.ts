import { mount } from "@cloudflare/nimbus-docs/client";

declare global {
  interface Window {
    OneTrust?: { ToggleInfoDisplay: () => void };
  }
}

export function initCookiePreferences(root: HTMLElement) {
  const button = root.querySelector("button");
  if (!button) return () => {};

  const updateVisibility = () => {
    root.hidden = typeof window.OneTrust?.ToggleInfoDisplay !== "function";
  };
  const openPreferences = () => window.OneTrust?.ToggleInfoDisplay();

  window.addEventListener("OneTrustGroupsUpdated", updateVisibility);
  button.addEventListener("click", openPreferences);
  updateVisibility();

  return () => {
    window.removeEventListener("OneTrustGroupsUpdated", updateVisibility);
    button.removeEventListener("click", openPreferences);
  };
}

mount("[data-cookie-preferences]", initCookiePreferences);
