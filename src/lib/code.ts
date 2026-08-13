export const CODE_LANG_SELECTOR_ATTR = "data-code-lang-selector";
export const CODE_LANG_CHANGE_EVENT = "portal:code-language-change";
const STORAGE_KEY = "portal-synced-tabs__backend_lang";
const hasDocument = typeof document !== "undefined";
const hasWindow = typeof window !== "undefined";
let restoreScrollAnchoringFrame: number | null = null;
let previousOverflowAnchor: string | null = null;

const pauseScrollAnchoring = () => {
  if (!hasDocument || !hasWindow) {
    return;
  }

  if (restoreScrollAnchoringFrame !== null) {
    window.cancelAnimationFrame(restoreScrollAnchoringFrame);
  } else {
    previousOverflowAnchor = document.documentElement.style.overflowAnchor;
  }

  document.documentElement.style.overflowAnchor = "none";
};

const resumeScrollAnchoringAfterPaint = () => {
  if (!hasDocument || !hasWindow) {
    return;
  }

  restoreScrollAnchoringFrame = window.requestAnimationFrame(() => {
    restoreScrollAnchoringFrame = window.requestAnimationFrame(() => {
      document.documentElement.style.overflowAnchor =
        previousOverflowAnchor ?? "";
      previousOverflowAnchor = null;
      restoreScrollAnchoringFrame = null;
    });
  });
};

const setSelectorValues = (lang: string) => {
  if (!hasDocument) {
    return;
  }

  document
    .querySelectorAll<HTMLSelectElement>(`[${CODE_LANG_SELECTOR_ATTR}]`)
    .forEach((selector) => {
      selector.value = Array.from(selector.options).some(
        (option) => option.value === lang,
      )
        ? lang
        : (selector.options.item(0)?.value ?? "");
    });
};

const updateCodeblocks = (lang: string, anchor?: Element) => {
  if (!hasDocument) {
    return;
  }

  const anchorTop = anchor?.isConnected
    ? anchor.getBoundingClientRect().top
    : null;

  if (anchorTop !== null) {
    pauseScrollAnchoring();
  }

  for (const block of document.querySelectorAll(".multi-lang")) {
    const samples = Array.from(block.querySelectorAll<HTMLElement>(".code"));
    const selected =
      samples.find((sample) => sample.dataset.lang === lang) ?? samples[0];

    samples.forEach((sample) => sample.classList.remove("active"));
    selected?.classList.add("active");
  }

  setSelectorValues(lang);

  if (anchorTop !== null && hasWindow && anchor?.isConnected) {
    const offset = anchor.getBoundingClientRect().top - anchorTop;
    if (offset) {
      window.scrollBy(0, offset);
    }
    resumeScrollAnchoringAfterPaint();
  }
};

export const currentLanguage = (): string | null => {
  if (!hasWindow) {
    return null;
  }

  return window.localStorage.getItem(STORAGE_KEY);
};

export const setCurrentLanguage = (lang: string, anchor?: Element) => {
  if (hasWindow) {
    window.localStorage.setItem(STORAGE_KEY, lang);
  }

  updateCodeblocks(lang, anchor);

  if (hasWindow) {
    window.dispatchEvent(
      new CustomEvent(CODE_LANG_CHANGE_EVENT, {
        detail: { language: lang },
      }),
    );
  }
};

const initCodeblocks = () => {
  const lang = currentLanguage();
  if (lang) {
    updateCodeblocks(lang);
  }
};

if (hasDocument) {
  document.addEventListener("astro:page-load", initCodeblocks);
  document.addEventListener("DOMContentLoaded", initCodeblocks);
}
