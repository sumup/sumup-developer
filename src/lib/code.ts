export const CODE_LANG_SELECTOR_ATTR = "data-code-lang-selector";
const STORAGE_KEY = "starlight-synced-tabs__backend_lang";
const hasDocument = typeof document !== "undefined";
const hasWindow = typeof window !== "undefined";

const setSelectorValues = (lang: string) => {
  if (!hasDocument) {
    return;
  }

  document
    .querySelectorAll<HTMLSelectElement>(`[${CODE_LANG_SELECTOR_ATTR}]`)
    .forEach((selector) => {
      selector.value = lang;
    });
};

const updateCodeblocks = (lang: string) => {
  if (!hasDocument) {
    return;
  }

  for (const block of document.querySelectorAll(".multi-lang .code")) {
    block.classList.remove("active");
  }

  for (const code of document.querySelectorAll(
    `.multi-lang .code[data-lang="${lang}"]`,
  )) {
    code.classList.add("active");
  }

  setSelectorValues(lang);
};

export const currentLanguage = (): string | null => {
  if (!hasWindow) {
    return null;
  }

  return window.localStorage.getItem(STORAGE_KEY);
};

export const setCurrentLanguage = (lang: string) => {
  if (hasWindow) {
    window.localStorage.setItem(STORAGE_KEY, lang);
  }

  updateCodeblocks(lang);
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
