const updateCodeblocks = (lang: string) => {
  for (const block of document.querySelectorAll(".multi-lang .code")) {
    block.classList.remove("active");
  }

  for (const code of document.querySelectorAll(
    `.multi-lang .code[data-lang="${lang}"]`,
  )) {
    code.classList.add("active");
  }

  for (const selector of document.querySelectorAll(".langSelector")) {
    (selector as HTMLSelectElement).value = lang;
  }
};

export const currentLanguage = () => {
  return localStorage.getItem("language");
};

export const setCurrentLanguage = (lang: string) => {
  localStorage.setItem("language", lang);
  updateCodeblocks(lang);
};

document.addEventListener("DOMContentLoaded", () => {
  const lang = currentLanguage();
  if (lang) {
    updateCodeblocks(lang);
  }
});
