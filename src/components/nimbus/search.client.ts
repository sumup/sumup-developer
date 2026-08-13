import { mount } from "@cloudflare/nimbus-docs/client";
import type { SearchResult } from "@cloudflare/nimbus-docs/types";

interface PagefindResultData {
  url: string;
  excerpt?: string;
  meta?: { title?: string };
  sub_results?: Array<{ title?: string; url?: string }>;
}

interface PagefindApi {
  init(): Promise<void>;
  search(query: string): Promise<{
    results: Array<{ data(): Promise<PagefindResultData> }>;
  }>;
}

let pagefind: PagefindApi | undefined;

async function search(query: string): Promise<SearchResult[]> {
  if (!pagefind) {
    const base = new URL(
      import.meta.env.BASE_URL ?? "/",
      window.location.origin,
    );
    const url = new URL("pagefind/pagefind.js", base);
    pagefind = (await import(/* @vite-ignore */ url.href)) as PagefindApi;
    await pagefind.init();
  }

  const response = await pagefind.search(query);
  const results = await Promise.all(
    response.results.slice(0, 10).map((result) => result.data()),
  );

  return results.map((result) => ({
    title: result.meta?.title ?? "Untitled",
    url: result.url,
    snippet: result.excerpt,
    subResults: result.sub_results
      ?.filter((item): item is Required<(typeof result.sub_results)[number]> =>
        Boolean(item.title && item.url),
      )
      .map((item) => ({ title: item.title, url: item.url })),
  }));
}

type SearchDialog = HTMLDialogElement & { openSearch?: () => void };

let globalListenersBound = false;

function getDialog(): SearchDialog | null {
  return document.querySelector<SearchDialog>("[data-search-dialog]");
}

function bindGlobalListeners() {
  if (globalListenersBound) return;
  globalListenersBound = true;

  document.addEventListener("click", (event) => {
    if (!(event.target as Element | null)?.closest("[data-search-trigger]")) {
      return;
    }
    getDialog()?.openSearch?.();
  });

  document.addEventListener("keydown", (event) => {
    if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") {
      return;
    }
    const dialog = getDialog();
    if (!dialog) return;
    event.preventDefault();
    if (dialog.open) dialog.close();
    else dialog.openSearch?.();
  });
}

mount("[data-search-dialog]", (element) => {
  const dialog = element as SearchDialog;
  const input = dialog.querySelector<HTMLInputElement>("[data-search-input]");
  const results = dialog.querySelector<HTMLElement>("[data-search-results]");
  const empty = dialog.querySelector<HTMLElement>("[data-search-empty]");
  const close = dialog.querySelector<HTMLButtonElement>("[data-search-close]");
  if (!input || !results || !empty || !close) return () => {};

  const controller = new AbortController();
  const { signal } = controller;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let activeIndex = -1;

  const options = () =>
    Array.from(results.querySelectorAll<HTMLElement>("[role='option']"));

  const setActive = (index: number) => {
    const items = options();
    activeIndex = Math.max(-1, Math.min(index, items.length - 1));
    items.forEach((item, itemIndex) => {
      item.toggleAttribute("data-highlighted", itemIndex === activeIndex);
    });
    const active = items[activeIndex];
    if (active) {
      input.setAttribute("aria-activedescendant", active.id);
      active.scrollIntoView({ block: "nearest" });
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  };

  const clear = () => {
    options().forEach((option) => option.remove());
    input.setAttribute("aria-expanded", "false");
    setActive(-1);
  };

  const makeLink = (title: string, href: string) => {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = title;
    return link;
  };

  const renderResult = (result: SearchResult, index: number) => {
    const option = document.createElement("div");
    option.id = `search-result-${index}`;
    option.className = "search-result";
    option.setAttribute("role", "option");
    const link = makeLink(result.title, result.url);
    option.append(link);

    if (result.snippet) {
      const snippet = document.createElement("p");
      snippet.innerHTML = result.snippet;
      option.append(snippet);
    }

    if (result.subResults?.length) {
      const subResults = document.createElement("div");
      subResults.className = "search-sub-results";
      result.subResults
        .slice(0, 3)
        .forEach((item) => subResults.append(makeLink(item.title, item.url)));
      option.append(subResults);
    }

    option.addEventListener("click", (event) => {
      if (!(event.target as Element | null)?.closest("a")) link.click();
    });
    return option;
  };

  const runSearch = async (query: string) => {
    clear();
    empty.hidden = false;
    empty.textContent = "Searching…";
    try {
      const found = await search(query);
      if (signal.aborted) return;
      empty.hidden = found.length > 0;
      empty.textContent = found.length ? "" : "No results found.";
      found.forEach((result, index) =>
        results.append(renderResult(result, index)),
      );
      input.setAttribute("aria-expanded", String(found.length > 0));
    } catch {
      empty.hidden = false;
      empty.textContent = "Search is available after a production build.";
    }
  };

  input.addEventListener(
    "input",
    () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        const query = input.value.trim();
        if (query) void runSearch(query);
        else {
          clear();
          empty.hidden = false;
          empty.textContent = "Type to search…";
        }
      }, 150);
    },
    { signal },
  );

  dialog.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActive(activeIndex + 1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActive(activeIndex - 1);
      } else if (event.key === "Enter" && activeIndex >= 0) {
        event.preventDefault();
        options()[activeIndex]?.querySelector<HTMLAnchorElement>("a")?.click();
      }
    },
    { signal },
  );

  close.addEventListener("click", () => dialog.close(), { signal });
  dialog.addEventListener(
    "click",
    (event) => {
      if (event.target === dialog) dialog.close();
    },
    { signal },
  );

  dialog.openSearch = () => {
    if (!dialog.open) dialog.showModal();
    input.value = "";
    clear();
    empty.hidden = false;
    empty.textContent = "Type to search…";
    input.focus();
  };

  return () => {
    controller.abort();
    if (timer) clearTimeout(timer);
  };
});

bindGlobalListeners();
