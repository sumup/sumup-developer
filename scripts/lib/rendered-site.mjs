import { readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { JSDOM } from "jsdom";

export const siteOrigin = "https://developer.sumup.com";

export async function renderedSite(outputRoot) {
  async function listFiles(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    return (
      await Promise.all(
        entries.map((entry) => {
          const path = join(directory, entry.name);
          return entry.isDirectory() ? listFiles(path) : [path];
        }),
      )
    ).flat();
  }
  const files = await listFiles(outputRoot);
  const outputPath = (file) => relative(outputRoot, file).split(sep).join("/");
  const generated = new Set(files.map(outputPath));
  const redirects = (await readFile(join(outputRoot, "_redirects"), "utf8"))
    .split("\n")
    .filter((line) => line.trim() && !line.trim().startsWith("#"))
    .map((line) => {
      const [from, to, status = "302"] = line.trim().split(/\s+/);
      const pattern = from
        .split("*")
        .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("(.*)");
      return { from: new RegExp(`^${pattern}$`), to, status: Number(status) };
    });
  function resolve(url) {
    const seen = new Set();
    while (url.origin === siteOrigin) {
      if (seen.has(url.href)) return undefined;
      seen.add(url.href);
      const redirect = redirects.find(
        (rule) =>
          rule.status >= 300 &&
          rule.status < 400 &&
          rule.from.test(url.pathname),
      );
      if (redirect) {
        const match = url.pathname.match(redirect.from);
        const destination = new URL(
          redirect.to.replace(":splat", match[1] ?? ""),
          url,
        );
        if (!destination.hash) destination.hash = url.hash;
        url = destination;
        continue;
      }
      const path = decodeURIComponent(url.pathname).replace(/^\/+/, "");
      const candidates = path
        ? [path, `${path.replace(/\/$/, "")}/index.html`, `${path}.html`]
        : ["index.html"];
      const file = candidates.find((candidate) => generated.has(candidate));
      return file ? { file: join(outputRoot, file), url } : undefined;
    }
    return { url }; // An explicitly configured external redirect is a valid local link.
  }
  const cache = new Map();
  async function page(file) {
    if (cache.has(file)) return cache.get(file);
    const dom = new JSDOM(await readFile(file, "utf8"));
    const document = dom.window.document;
    const result = {
      codeBlocks: Array.from(
        document.querySelectorAll("main pre code"),
        (code) => code.textContent,
      ),
      links: Array.from(document.querySelectorAll("a[href]"), (anchor) =>
        anchor.getAttribute("href"),
      ),
      ids: new Set(
        Array.from(
          document.querySelectorAll("[id], a[name]"),
          (node) => node.id || node.getAttribute("name"),
        ),
      ),
      markdownUrl: document
        .querySelector('link[rel="alternate"][type="text/markdown"]')
        ?.getAttribute("href"),
      llmsUrl: document
        .querySelector('link[rel="alternate"][title="LLM index"]')
        ?.getAttribute("href"),
      canonical: document
        .querySelector('link[rel="canonical"]')
        ?.getAttribute("href"),
      noindex: document
        .querySelector('meta[name="robots"]')
        ?.getAttribute("content")
        ?.includes("noindex"),
      modified: document
        .querySelector('meta[property="article:modified_time"]')
        ?.getAttribute("content"),
    };
    dom.window.close();
    cache.set(file, result);
    return result;
  }
  const urlForFile = (file) =>
    new URL(`/${outputPath(file).replace(/index\.html$/, "")}`, siteOrigin);
  return {
    files,
    htmlFiles: files.filter((file) => file.endsWith(".html")),
    outputPath,
    resolve,
    page,
    urlForFile,
  };
}
