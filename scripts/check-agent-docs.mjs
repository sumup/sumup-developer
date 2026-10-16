import assert from "node:assert/strict";
import { glob, readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { mdxToMdast, markdownToMdast } from "satteri";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { renderedSite, siteOrigin } from "./lib/rendered-site.mjs";
import { resolve } from "node:path";
import { parse } from "yaml";
import { agentSetupPrompt } from "../src/lib/agentSetup.ts";
import {
  parseStaticHeaders,
  staticHeaderValues,
} from "./lib/static-headers.mjs";
import {
  createMarkdownComponents,
  preservedMarkdownComponents,
} from "../src/lib/markdownComponents.ts";

const output = "dist/client";
const site = await renderedSite(resolve(output));
const headerRules = parseStaticHeaders(
  await readFile(join(output, "_headers"), "utf8"),
);
let checkedHeaders = 0;
for (const file of site.files) {
  const path = `/${site.outputPath(file)}`;
  const url = file.endsWith(".html")
    ? site.urlForFile(file)
    : new URL(path, siteOrigin);
  const cors = staticHeaderValues(
    headerRules,
    url,
    "Access-Control-Allow-Origin",
  );
  const types = staticHeaderValues(headerRules, url, "Content-Type");
  assert(cors.length <= 1, `${path}: overlapping CORS headers`);
  assert(
    types.length <= 1 && !types[0]?.includes(","),
    `${path}: overlapping Content-Type headers`,
  );
  if (
    /\/index\.mdx?$|\/llms(?:-full)?\.txt$|^\/\.well-known\/|^\/openapi\.json$/.test(
      path,
    )
  ) {
    assert.deepEqual(
      cors,
      ["*"],
      `${path}: agent artifacts must allow cross-origin reads`,
    );
    checkedHeaders++;
  }
}
const index = await readFile(join(output, "llms.txt"), "utf8");
const rootMarkdown = await readFile(join(output, "index.md"), "utf8");
assert(
  rootMarkdown.includes(index.trim()),
  "Homepage Markdown must expose the documentation index",
);
const markdownLinks = (tree) => {
  const links = [];
  const visit = (node) => {
    if (
      node.type === "link" ||
      node.type === "image" ||
      node.type === "definition"
    )
      links.push(node.url);
    node.children?.forEach(visit);
  };
  visit(tree);
  return links;
};
const reachable = (href, base) => {
  const url = new URL(href, base);
  if (url.origin !== siteOrigin) return;
  assert(site.resolve(url), `${base}: missing agent target ${href}`);
};
let indexes = 0;
for (const file of site.files.filter((file) => file.endsWith("/llms.txt"))) {
  const markdown = await readFile(file, "utf8");
  assert(
    markdown.trim().startsWith("# "),
    `${file}: invalid documentation index`,
  );
  const base = new URL(`/${site.outputPath(file)}`, siteOrigin);
  for (const href of markdownLinks(markdownToMdast(markdown)))
    reachable(href, base);
  indexes++;
}
let alternates = 0;
for (const file of site.htmlFiles) {
  const page = await site.page(file);
  // API fragments keep their separate CommonMark renderer until the API review.
  if (!site.outputPath(file).startsWith("api/")) {
    assert.deepEqual(
      page.rawAdmonitions,
      [],
      `${file}: unrendered callout directives`,
    );
  }
  for (const href of [page.markdownUrl, page.llmsUrl].filter(Boolean)) {
    reachable(href, site.urlForFile(file));
    alternates++;
  }
}
const full = await readFile(join(output, "llms-full.txt"), "utf8");
// Verify each example in its own page's bundle section, so an identical
// snippet elsewhere cannot hide a conversion regression during Nimbus upgrades.
const fullSections = new Map(
  full
    .split(
      /(?=^Source: https:\/\/developer\.sumup\.com\/.* · Markdown: .*\/index\.md$)/m,
    )
    .flatMap((section) => {
      const source = section.match(/^Source: (\S+) · Markdown:/);
      return source ? [[source[1], section]] : [];
    }),
);
const codeBlocks = (tree) => {
  const blocks = [];
  const visit = (node) => {
    if (node.type === "code") blocks.push(node.value);
    node.children?.forEach(visit);
  };
  visit(tree);
  return blocks;
};
let pages = 0;
let examples = 0;
let renderedExamples = 0;
const mappedComponents = createMarkdownComponents("coverage");
const usedComponents = new Set();
for await (const file of glob("src/content/docs/**/*.{md,mdx}")) {
  const source = await readFile(file, "utf8");
  if (/^draft:\s*true$/m.test(source)) continue;
  const path = relative("src/content/docs", file)
    .replace(/\.(md|mdx)$/, "")
    .replace(/(^|\/)index$/, "");
  const markdown = await readFile(join(output, path, "index.md"), "utf8");
  if (path === "tools/llms/setup") {
    assert(
      markdown.includes(agentSetupPrompt),
      "Setup Markdown lost the copyable agent prompt",
    );
    assert(
      fullSections
        .get(`https://developer.sumup.com/${path}/`)
        ?.includes(agentSetupPrompt),
      "Full documentation lost the copyable agent prompt",
    );
  }
  const raw = await readFile(join(output, path, "index.mdx"), "utf8");
  const sourceBody = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
  const sourceTree = mdxToMdast(sourceBody);
  const markdownTree = markdownToMdast(markdown);
  const normalizeUrl = (href) => new URL(href, `${siteOrigin}/${path}/`).href;
  const publishedLinks = new Set(markdownLinks(markdownTree).map(normalizeUrl));
  const bundledLinks = new Set(
    markdownLinks(
      markdownToMdast(fullSections.get(`${siteOrigin}/${path}/`) ?? ""),
    ).map(normalizeUrl),
  );
  const checkComponents = (node) => {
    if (node.type.startsWith("mdxJsx") && /^[A-Z]/.test(node.name ?? "")) {
      assert(
        Object.hasOwn(mappedComponents, node.name) ||
          preservedMarkdownComponents.has(node.name),
        `${path}: ${node.name} needs a Markdown renderer or an explicit content-preservation policy`,
      );
      usedComponents.add(node.name);
      if (["Image", "ReaderHero", "SoloScreen", "Video"].includes(node.name)) {
        for (const attribute of node.attributes.filter((attribute) =>
          ["src", "trackSrc"].includes(attribute.name),
        )) {
          assert.equal(
            typeof attribute.value,
            "string",
            `${path}: ${node.name}.${attribute.name} must use a static URL for Markdown`,
          );
          const url = normalizeUrl(attribute.value);
          assert(
            publishedLinks.has(url),
            `${path}: Markdown lost ${node.name}.${attribute.name}: ${attribute.value}`,
          );
          assert(
            bundledLinks.has(url),
            `${path}: full bundle lost ${node.name}.${attribute.name}: ${attribute.value}`,
          );
        }
      }
    }
    node.children?.forEach(checkComponents);
  };
  checkComponents(sourceTree);
  const published = codeBlocks(markdownTree);
  const rawCode = codeBlocks(
    mdxToMdast(raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "")),
  );
  const bundled = fullSections.get(`https://developer.sumup.com/${path}/`);
  assert(bundled, `${path}: missing from full documentation`);
  const bundledCode = codeBlocks(markdownToMdast(bundled));
  const html = await site.page(join(output, path, "index.html"));
  for (const code of html.codeBlocks) {
    // HTML renderers may add a terminal line ending to the code element.
    const sameCode = (candidate) =>
      candidate.replace(/\n$/, "") === code.replace(/\n$/, "");
    assert(
      published.some(sameCode),
      `${path}: rendered code missing from Markdown`,
    );
    assert(
      bundledCode.some(sameCode),
      `${path}: rendered code missing from the full bundle`,
    );
    renderedExamples++;
  }
  for (const code of codeBlocks(sourceTree)) {
    assert(
      published.includes(code),
      `${path}: published code differs from source: ${code.slice(0, 100)}`,
    );
    assert(
      bundledCode.includes(code),
      `${path}: code missing from its llms-full.txt section`,
    );
    examples++;
  }
  for (const code of codeBlocks(sourceTree)) {
    assert(
      rawCode.includes(code),
      `${path}: MDX source variant lost a code example`,
    );
  }
  for (const href of markdownLinks(markdownToMdast(markdown)))
    reachable(href, `https://developer.sumup.com/${path}/index.md`);
  const prose = markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`\n]+`/g, "");
  assert(
    !/^(import |export )|<\/?[A-Z][A-Za-z]*\b|\{\/\*/m.test(prose),
    `${path}: leaked MDX`,
  );
  assert(
    markdown.includes(`Source: https://developer.sumup.com/${path}/`),
    `${path}: missing canonical URL`,
  );
  assert(
    full.includes(`Source: https://developer.sumup.com/${path}/`),
    `${path}: missing from full documentation`,
  );
  pages++;
}
const contract = JSON.parse(
  await readFile(join(output, "openapi.json"), "utf8"),
);
assert(
  JSON.stringify(contract) ===
    JSON.stringify(JSON.parse(await readFile("openapi.json", "utf8"))),
  "Published OpenAPI differs from the source contract",
);
assert(
  (await readFile(join(output, "llms.txt"), "utf8")).includes(
    "https://developer.sumup.com/openapi.json",
  ),
);
const skills = JSON.parse(
  await readFile(join(output, ".well-known/agent-skills/index.json"), "utf8"),
);
assert.equal(
  skills.$schema,
  "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
);
assert(skills.skills.length > 0, "No published skills");
const names = new Set();
for (const skill of skills.skills) {
  assert(!names.has(skill.name), `Duplicate skill ${skill.name}`);
  names.add(skill.name);
  assert(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(skill.name) && skill.name.length <= 64,
    `Invalid skill name ${skill.name}`,
  );
  const artifact = site.resolve(
    new URL(skill.url, `${siteOrigin}/.well-known/agent-skills/index.json`),
  )?.file;
  assert(artifact, `${skill.name}: missing artifact`);
  assert.equal(
    skill.digest,
    `sha256:${createHash("sha256")
      .update(await readFile(artifact))
      .digest("hex")}`,
    `${skill.name}: archive digest mismatch`,
  );
  assert.equal(skill.type, "archive");
  const members = execFileSync("tar", ["-tzf", artifact], { encoding: "utf8" })
    .trim()
    .split("\n");
  assert(members.includes("SKILL.md"), `${skill.name}: missing root SKILL.md`);
  assert(
    members.every(
      (member) => !member.startsWith("/") && !member.split("/").includes(".."),
    ),
    `${skill.name}: invalid archive paths`,
  );
  for (const member of members.filter((member) => !member.endsWith("/"))) {
    assert.deepEqual(
      execFileSync("tar", ["-xOzf", artifact, member]),
      await readFile(join("skills", skill.name, member)),
      `${skill.name}: published ${member} differs from the pinned source`,
    );
  }
  const source = execFileSync("tar", ["-xOzf", artifact, "SKILL.md"], {
    encoding: "utf8",
  });
  const metadata = parse(source.match(/^---\r?\n([\s\S]*?)\r?\n---/)[1]);
  assert.equal(metadata.name, skill.name);
  assert.equal(metadata.description, skill.description);
}
assert.deepEqual(
  [...names].sort(),
  (await readdir("skills", { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort(),
  "Published discovery must include every imported skill",
);
const card = JSON.parse(
  await readFile(join(output, ".well-known/mcp/server-card.json"), "utf8"),
);
// Server Cards are experimental; the hosted schema URI is not published yet.
// These constraints follow modelcontextprotocol/ext-server-card/schema.ts.
assert.equal(
  card.$schema,
  "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json",
);
assert(/^[a-zA-Z0-9.-]+\/[a-zA-Z0-9._-]+$/.test(card.name));
assert(card.description.length >= 1 && card.description.length <= 100);
assert.equal(card.remotes[0].url, "https://mcp.sumup.com/mcp");
assert.equal(card.remotes[0].type, "streamable-http");
assert(
  !card.remotes[0].headers?.some(
    (header) => header.isRequired && header.name === "Authorization",
  ),
  "Hosted MCP must not advertise required API-key authentication",
);
assert(
  card.description.includes("OAuth"),
  "Hosted MCP must describe OAuth sign-in",
);
const catalog = JSON.parse(
  await readFile(join(output, ".well-known/ai-catalog.json"), "utf8"),
);
assert.deepEqual(
  catalog,
  JSON.parse(await readFile(join(output, ".well-known/ard.json"), "utf8")),
  "Agent discovery catalogs differ",
);
assert.equal(catalog.specVersion, "1.0");
assert(
  catalog.entries.some(
    (entry) => entry.type === "application/mcp-server-card+json",
  ),
  "AI catalog must advertise the MCP server card",
);
const identifiers = new Set();
for (const entry of catalog.entries) {
  assert(
    !identifiers.has(entry.identifier),
    `Duplicate catalog identifier ${entry.identifier}`,
  );
  identifiers.add(entry.identifier);
  assert(entry.identifier.startsWith("urn:air:developer.sumup.com:"));
  reachable(entry.url, siteOrigin);
}
// Only dated pages should have lastmod, and it must match the page metadata.
const sitemap = await readFile(join(output, "sitemap-0.xml"), "utf8");
for (const match of sitemap.matchAll(
  /<url><loc>([^<]+)<\/loc>([\s\S]*?)<\/url>/g,
)) {
  const target = site.resolve(new URL(match[1]));
  assert(target?.file, `Sitemap target is missing: ${match[1]}`);
  const page = await site.page(target.file);
  assert(!page.noindex, `Sitemap advertises noindex page: ${match[1]}`);
  const modified = match[2].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
  assert.equal(
    modified,
    page.modified,
    `Sitemap date differs from page: ${match[1]}`,
  );
}
console.log(
  `Verified ${pages} Markdown/MDX pages, ${examples} authored and ${renderedExamples} rendered code examples, ${usedComponents.size} component types, ${indexes} indexes, ${alternates} HTML discovery links, ${checkedHeaders} agent artifact headers, ${names.size} skill archives, MCP metadata, sitemap dates, the full bundle, and OpenAPI.`,
);
