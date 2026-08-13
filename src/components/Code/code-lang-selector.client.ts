import { mount } from "@cloudflare/nimbus-docs/client";

import {
  CODE_LANG_CHANGE_EVENT,
  CODE_LANG_SELECTOR_ATTR,
  currentLanguage,
  setCurrentLanguage,
} from "@lib/code";

function initCodeLangSelector(root: HTMLElement) {
  const select = root.querySelector<HTMLSelectElement>(
    `[${CODE_LANG_SELECTOR_ATTR}]`,
  );

  if (!select) {
    return () => {};
  }

  const selectLanguage = (language: string | null) => {
    const hasLanguage = Array.from(select.options).some(
      ({ value }) => value === language,
    );
    select.value = hasLanguage && language ? language : select.options[0].value;
  };

  const handleChange = () => {
    setCurrentLanguage(select.value, select);
  };
  const handleGlobalChange = (event: Event) => {
    const { language } = (event as CustomEvent<{ language: string }>).detail;
    selectLanguage(language);
  };

  selectLanguage(currentLanguage());
  select.addEventListener("change", handleChange);
  window.addEventListener(CODE_LANG_CHANGE_EVENT, handleGlobalChange);

  return () => {
    select.removeEventListener("change", handleChange);
    window.removeEventListener(CODE_LANG_CHANGE_EVENT, handleGlobalChange);
  };
}

mount("[data-code-lang-control]", initCodeLangSelector);
