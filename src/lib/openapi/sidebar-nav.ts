import { getApiScrollTarget, parseApiPath } from "./routes";

/**
 * Current sidebar links keyed by target section ID.
 * Updated on each init call, then used by the shared scroll listener.
 */
let currentLinksBySectionId = new Map<string, HTMLAnchorElement[]>();
/** Ensures we register at most one global scroll listener. */
let scrollListenerBound = false;

/** Updates active sidebar state and auto-expands parent groups while closing previously auto-opened groups. */
const applyCurrentLinks = (activeLinks?: HTMLAnchorElement[]) => {
  if (!activeLinks?.length) return;

  document
    .querySelectorAll(
      '[data-portal-sidebar] [aria-current="page"], [data-mobile-sidebar] [aria-current="page"]',
    )
    .forEach((link) => link.removeAttribute("aria-current"));
  activeLinks.forEach((link) => link.setAttribute("aria-current", "page"));

  const activeGroups = new Set<HTMLDetailsElement>();
  activeLinks.forEach((link) => {
    const details = link.closest("details") as HTMLDetailsElement | null;
    if (!details) return;
    activeGroups.add(details);
    if (!details.open) {
      details.open = true;
      details.dataset.wasAutoOpened = "true";
    }
  });

  Array.from(
    document.querySelectorAll<HTMLDetailsElement>(
      "details[data-was-auto-opened]",
    ),
  )
    .filter((candidate) => !activeGroups.has(candidate))
    .forEach((candidate) => {
      candidate.removeAttribute("open");
      delete candidate.dataset.wasAutoOpened;
    });
};

/** Closes the mobile sidebar after a sidebar click-driven in-page scroll. */
const closeMobileMenu = () => {
  document.querySelector<HTMLDialogElement>("[data-mobile-sidebar]")?.close();
};

/**
 * Initializes API sidebar scroll syncing for the current page.
 *
 * Click handlers are attached once per link and one global scroll listener is
 * reused across both desktop and mobile sidebar copies.
 */
export const initApiSidebarNavigation = () => {
  const currentPath = parseApiPath(window.location.pathname);
  const allLinks = Array.from(
    document.querySelectorAll<HTMLAnchorElement>(
      "[data-portal-sidebar] a[data-scroll-to], [data-mobile-sidebar] a[data-scroll-to]",
    ),
  );
  if (allLinks.length === 0) return;

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

  const linkBySectionId = new Map<string, HTMLAnchorElement[]>();
  for (const link of links) {
    const sectionId = link.getAttribute("data-scroll-to");
    if (!sectionId || !document.getElementById(sectionId)) {
      continue;
    }

    const sectionLinks = linkBySectionId.get(sectionId) ?? [];
    sectionLinks.push(link);
    linkBySectionId.set(sectionId, sectionLinks);
  }
  currentLinksBySectionId = linkBySectionId;

  for (const [sectionId, sectionLinks] of currentLinksBySectionId.entries()) {
    for (const link of sectionLinks) {
      if (link.dataset.apiSidebarScrollHandler === "true") continue;

      const handler = (event: Event) => {
        const target = document.getElementById(sectionId);
        if (!target) return;

        event.preventDefault();
        applyCurrentLinks(sectionLinks);
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
  }

  const onScroll = () => {
    let closestLinks: HTMLAnchorElement[] | undefined;
    let closestDistance = Infinity;

    for (const [sectionId, links] of currentLinksBySectionId.entries()) {
      const section = document.getElementById(sectionId);
      if (!section) continue;

      const distanceFromTop = Math.abs(
        section.getBoundingClientRect().top - 50,
      );
      if (distanceFromTop < closestDistance) {
        closestDistance = distanceFromTop;
        closestLinks = links;
      }
    }

    applyCurrentLinks(closestLinks);
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
      applyCurrentLinks(currentLinksBySectionId.get(selectedTarget));
    }
  }
};
