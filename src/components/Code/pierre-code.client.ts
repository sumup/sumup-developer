import { mount } from "@cloudflare/nimbus-docs/client";
import type { File as PierreFile } from "@pierre/diffs";
import { applyNotations, readNotations } from "./pierre-notations";
import shadowStyles from "./pierre-code.css?raw";

// Load the renderer and themes once, only when a snippet approaches the viewport.
let renderer: ReturnType<typeof loadRenderer> | undefined;
async function loadRenderer() {
  const [diffs, { codeThemes }] = await Promise.all([
    import("@pierre/diffs"),
    import("../../lib/codeThemes"),
  ]);
  for (const theme of Object.values(codeThemes)) {
    diffs.registerCustomTheme(theme.name, async () => theme);
  }
  return diffs;
}

export function initPierreCode(pre: HTMLElement): () => void {
  const frame = pre.closest<HTMLElement>(".nb-code-figure");
  if (!frame || !window.IntersectionObserver) return () => {};
  const code = pre.querySelector("code");
  if (!code) return () => {};
  let disposed = false;
  let instance: PierreFile | undefined;
  let host: HTMLElement | undefined;
  const notations = readNotations(pre);
  const themeType = () =>
    document.documentElement.dataset.mode === "dark" ? "dark" : "light";
  const themeObserver = new MutationObserver(() => {
    instance?.setThemeType(themeType());
  });

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      void enhance();
    },
    { rootMargin: "200px" },
  );

  async function enhance() {
    try {
      const { File } = await (renderer ??= loadRenderer().catch((error) => {
        renderer = undefined;
        throw error;
      }));
      if (disposed) return;
      host = document.createElement("diffs-container");
      host.className = "portal-code";
      host.setAttribute(
        "aria-label",
        frame!.dataset.nbLang ? `${frame!.dataset.nbLang} code` : "Code",
      );
      if (pre.classList.contains("has-focused")) host.dataset.focused = "";
      // Nimbus keeps ownership of the frame, title, and clipboard source.
      pre.after(host);
      instance = new File({
        theme: { light: "pierre-light-vibrant", dark: "pierre-dark-vibrant" },
        themeType: themeType(),
        disableFileHeader: true,
        enableLineSelection: true,
        overflow: pre.hasAttribute("data-nb-wrap") ? "wrap" : "scroll",
        unsafeCSS: shadowStyles,
        disableErrorHandling: true,
        onPostRender(node, _instance, phase) {
          if (phase === "unmount" || disposed) return;
          if (node.shadowRoot) applyNotations(node.shadowRoot, notations);
          frame!.classList.add("pierre-ready");
        },
      });
      instance.render({
        file: {
          name:
            frame!.querySelector(".nb-code-title-name")?.textContent ??
            "snippet",
          contents: code!.textContent ?? "",
          lang: frame!.dataset.nbLang ?? "text",
        },
        fileContainer: host,
      });
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-mode"],
      });
    } catch (error) {
      instance?.cleanUp();
      host?.remove();
      frame!.classList.remove("pierre-ready");
      console.warn("Could not enhance code block", error);
    }
  }

  observer.observe(pre);
  return () => {
    disposed = true;
    observer.disconnect();
    themeObserver.disconnect();
    instance?.cleanUp();
    host?.remove();
    frame.classList.remove("pierre-ready");
  };
}

mount("pre.astro-code", initPierreCode);
