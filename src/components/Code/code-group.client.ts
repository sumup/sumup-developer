import { mount, readUrlParam } from "@cloudflare/nimbus-docs/client";
import { initSamples, SAMPLE_LANGUAGE_STORAGE_KEY } from "./samples";

// Match Shiki's short language tags to the API's prepared sample languages.
const languages: Record<string, string> = {
  ts: "typescript",
  js: "javascript",
  py: "python",
  sh: "bash",
};

export function initCodeGroup(root: HTMLElement): () => void {
  const select = root.querySelector<HTMLSelectElement>("select");
  const panels = [...root.querySelectorAll<HTMLElement>("[data-api-sample]")];
  if (!select || !panels.length) return () => {};

  select.replaceChildren(
    ...panels.map((panel) => {
      const language =
        panel.querySelector<HTMLElement>("[data-nb-lang]")?.dataset.nbLang ??
        panel.dataset.apiSample ??
        "";
      panel.dataset.apiLanguage = languages[language] ?? language;
      return new Option(panel.dataset.apiSample, panel.dataset.apiSample);
    }),
  );
  let saved = "";
  try {
    saved = localStorage.getItem(SAMPLE_LANGUAGE_STORAGE_KEY) ?? "";
  } catch {
    // The first example remains available when storage is blocked.
  }
  const find = (value: string) =>
    panels.find(
      (panel) =>
        panel.dataset.apiSample?.toLowerCase() === value.toLowerCase() ||
        panel.dataset.apiLanguage?.toLowerCase() === value.toLowerCase(),
    );
  const preferred = find(readUrlParam("lang") ?? "") ?? find(saved);
  if (preferred) select.value = preferred.dataset.apiSample ?? "";
  return initSamples(root);
}

mount("[data-code-group]", initCodeGroup);
