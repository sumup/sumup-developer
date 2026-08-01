import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";

import { JSDOM } from "jsdom";

const siteOrigin = "https://developer.sumup.com";
const outputRoot = resolve(process.argv[2] ?? "dist/client");
const apiRoot = join(outputRoot, "api");

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? listFiles(path) : [path];
    }),
  );

  return files.flat();
}

function outputPath(file) {
  return relative(outputRoot, file).split(sep).join("/");
}

function generatedFileCandidates(pathname) {
  const path = decodeURIComponent(pathname).replace(/^\/+/, "");

  if (!path) {
    return ["index.html"];
  }

  if (path.endsWith("/")) {
    return [`${path}index.html`];
  }

  return [path, `${path}/index.html`, `${path}.html`];
}

const outputFiles = await listFiles(outputRoot);
const generatedFiles = new Set(outputFiles.map(outputPath));
const apiPages = outputFiles.filter(
  (file) => file.startsWith(`${apiRoot}${sep}`) && file.endsWith(".html"),
);

if (apiPages.length === 0) {
  throw new Error(`No rendered API reference pages found in ${apiRoot}`);
}

const documentCache = new Map();

async function getDocument(file) {
  let document = documentCache.get(file);

  if (!document) {
    const html = await readFile(file, "utf8");
    document = new JSDOM(html).window.document;
    documentCache.set(file, document);
  }

  return document;
}

function resolveGeneratedFile(pathname) {
  const candidate = generatedFileCandidates(pathname).find((file) =>
    generatedFiles.has(file),
  );

  return candidate ? join(outputRoot, candidate) : undefined;
}

const failures = new Set();
let checkedLinks = 0;

for (const page of apiPages) {
  const document = await getDocument(page);
  const source = outputPath(page);

  for (const anchor of document.querySelectorAll("a[href]")) {
    const href = anchor.getAttribute("href");

    if (!href?.startsWith("/")) {
      continue;
    }

    const url = new URL(href, siteOrigin);

    if (url.origin !== siteOrigin) {
      continue;
    }

    checkedLinks += 1;
    const target = resolveGeneratedFile(url.pathname);

    if (!target) {
      failures.add(`${source}: ${href} (target does not exist)`);
    }
  }
}

if (failures.size > 0) {
  console.error("Invalid links found in the rendered API reference:");
  console.error(
    [...failures]
      .sort()
      .map((failure) => `- ${failure}`)
      .join("\n"),
  );
  process.exitCode = 1;
} else {
  console.log(
    `Checked ${checkedLinks} internal links across ${apiPages.length} rendered API reference pages.`,
  );
}
