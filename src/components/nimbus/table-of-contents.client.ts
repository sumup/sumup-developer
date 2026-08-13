import { mount } from "@cloudflare/nimbus-docs/client";

const READING_LINE = 0.25;
const BOTTOM_EPSILON = 2;

function initTableOfContents(root: HTMLElement) {
  const links = Array.from(
    root.querySelectorAll<HTMLAnchorElement>("[data-toc-link]"),
  );
  const select = root.querySelector<HTMLSelectElement>(
    "[data-mobile-toc-select]",
  );
  const slugs = links.length
    ? links
        .map((link) => link.dataset.tocLink)
        .filter((slug): slug is string => Boolean(slug))
    : Array.from(select?.options ?? [])
        .map((option) => option.value)
        .filter((slug) => slug !== "_top");
  const headings = slugs
    .map((slug) => ({ element: document.getElementById(slug), slug }))
    .filter(
      (heading): heading is { element: HTMLElement; slug: string } =>
        heading.element !== null,
    );

  if (headings.length === 0) {
    return () => {};
  }

  const controller = new AbortController();
  let animationFrame: number | undefined;
  let activeSlug: string | undefined;

  const setActive = (slug: string | undefined) => {
    if (activeSlug === slug) {
      return;
    }

    activeSlug = slug;
    links.forEach((link) => {
      if (link.dataset.tocLink === slug) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    if (select) {
      select.value = slug ?? "_top";
    }
  };

  const update = () => {
    const readingLine = window.innerHeight * READING_LINE;
    const scrollElement = document.scrollingElement ?? document.documentElement;
    const maxScroll = scrollElement.scrollHeight - window.innerHeight;
    const isAtBottom =
      maxScroll > BOTTOM_EPSILON &&
      scrollElement.scrollTop >= maxScroll - BOTTOM_EPSILON;
    let nextSlug: string | undefined;

    for (const heading of headings) {
      if (heading.element.getBoundingClientRect().top <= readingLine) {
        nextSlug = heading.slug;
      } else {
        break;
      }
    }

    setActive(isAtBottom ? headings.at(-1)?.slug : nextSlug);
  };

  const scheduleUpdate = () => {
    if (animationFrame !== undefined) {
      return;
    }

    animationFrame = window.requestAnimationFrame(() => {
      animationFrame = undefined;
      update();
    });
  };

  window.addEventListener("scroll", scheduleUpdate, {
    passive: true,
    signal: controller.signal,
  });
  window.addEventListener("resize", scheduleUpdate, {
    passive: true,
    signal: controller.signal,
  });

  const observer = new IntersectionObserver(scheduleUpdate);
  headings.forEach(({ element }) => observer.observe(element));

  select?.addEventListener(
    "change",
    () => {
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches
        ? "auto"
        : "smooth";
      const target = document.getElementById(select.value);

      if (select.value === "_top") {
        window.scrollTo({ top: 0, behavior });
      } else {
        target?.scrollIntoView({ behavior, block: "start" });
        history.replaceState(null, "", `#${select.value}`);
      }
    },
    { signal: controller.signal },
  );

  update();

  return () => {
    controller.abort();
    observer.disconnect();
    if (animationFrame !== undefined) {
      window.cancelAnimationFrame(animationFrame);
    }
  };
}

mount("[data-table-of-contents]", initTableOfContents);
