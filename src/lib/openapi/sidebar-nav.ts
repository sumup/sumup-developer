import { getApiScrollTarget, parseApiPath } from "./routes";

/**
 * Current sidebar links keyed by target section ID.
 * Updated on each init call, then used by the shared scroll listener.
 */
let currentLinksBySectionId = new Map<string, HTMLAnchorElement>();
/** Ensures we register at most one global scroll listener. */
let scrollListenerBound = false;

/** Updates active sidebar state and auto-expands parent groups while closing previously auto-opened groups. */
const applyCurrentLink = (activeLink?: HTMLAnchorElement) => {
  if (!activeLink) return;

  document
    .querySelector('[aria-current="page"]')
    ?.removeAttribute("aria-current");
  activeLink.setAttribute("aria-current", "page");

  const details = activeLink.closest("details") as HTMLDetailsElement | null;
  if (details && !details.hasAttribute("open")) {
    details.setAttribute("open", "");
    details.dataset.wasAutoOpened = "true";
  }

  Array.from(
    document.querySelectorAll<HTMLDetailsElement>(
      "details[data-was-auto-opened]",
    ),
  )
    .filter((candidate) => candidate !== details)
    .forEach((candidate) => {
      candidate.removeAttribute("open");
      delete candidate.dataset.wasAutoOpened;
    });
};

/** Closes the mobile sidebar after a sidebar click-driven in-page scroll. */
const closeMobileMenu = () => {
  document.body.toggleAttribute("data-mobile-menu-expanded", false);
  document
    .querySelector("starlight-menu-button")
    ?.setAttribute("aria-expanded", "false");
};

/**
 * Initializes API sidebar scroll syncing for the current page.
 *
 * Non-obvious behavior:
 * - It scopes links to Starlight's sidebar container (`#starlight__sidebar`).
 * - Click handlers are attached once per link (via dataset marker).
 * - A single global scroll listener is reused and reads from the latest link map.
 */
export const initApiSidebarNavigation = () => {
  const sidebarRoot = document.getElementById("starlight__sidebar");
  if (!sidebarRoot) {
    return;
  }
  const currentPath = parseApiPath(window.location.pathname);
  const allLinks = Array.from(
    sidebarRoot.querySelectorAll<HTMLAnchorElement>("a[data-scroll-to]"),
  );

  const links = allLinks.filter((link) => {
    const targetPath = parseApiPath(
      new URL(link.href, window.location.origin).pathname,
    );

    if (currentPath.kind !== targetPath.kind) return false;
    if (currentPath.kind === "top") return true;

    return (
      currentPath.kind === "tag" &&
      targetPath.kind === "tag" &&
      currentPath.tag === targetPath.tag
    );
  });

  const linkBySectionId = new Map<string, HTMLAnchorElement>();
  for (const link of links) {
    const sectionId = link.getAttribute("data-scroll-to");
    if (!sectionId || !document.getElementById(sectionId)) {
      continue;
    }

    if (!linkBySectionId.has(sectionId)) {
      linkBySectionId.set(sectionId, link);
    }
  }
  currentLinksBySectionId = linkBySectionId;

  for (const [sectionId, link] of currentLinksBySectionId.entries()) {
    if (link.dataset.apiSidebarScrollHandler === "true") {
      continue;
    }

    const handler = (event: Event) => {
      const target = document.getElementById(sectionId);
      if (!target) return;

      event.preventDefault();
      applyCurrentLink(link);
      target.scrollIntoView();
      history.pushState(
        {},
        "",
        link.getAttribute("href") || window.location.pathname,
      );
      closeMobileMenu();
    };

    link.dataset.apiSidebarScrollHandler = "true";
    link.addEventListener("click", handler);
  }

  const onScroll = () => {
    let closestLink: HTMLAnchorElement | undefined;
    let closestDistance = Infinity;

    for (const [sectionId, link] of currentLinksBySectionId.entries()) {
      const section = document.getElementById(sectionId);
      if (!section) continue;

      const distanceFromTop = Math.abs(
        section.getBoundingClientRect().top - 50,
      );
      if (distanceFromTop < closestDistance) {
        closestDistance = distanceFromTop;
        closestLink = link;
      }
    }

    applyCurrentLink(closestLink);
  };

  if (!scrollListenerBound) {
    document.addEventListener("scroll", onScroll, { passive: true });
    scrollListenerBound = true;
  }

  const selectedTarget = getApiScrollTarget(window.location.pathname);
  if (selectedTarget) {
    const initialTarget = document.getElementById(selectedTarget);
    if (initialTarget) {
      initialTarget.scrollIntoView();
      applyCurrentLink(currentLinksBySectionId.get(selectedTarget));
    }
  }
};
