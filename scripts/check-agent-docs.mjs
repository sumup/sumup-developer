import assert from "node:assert/strict";
import { glob, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { mdxToMdast, markdownToMdast } from "satteri";

const output = "dist/client";
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
for await (const file of glob("src/content/docs/**/*.{md,mdx}")) {
  const source = await readFile(file, "utf8");
  if (/^draft:\s*true$/m.test(source)) continue;
  const path = relative("src/content/docs", file)
    .replace(/\.(md|mdx)$/, "")
    .replace(/(^|\/)index$/, "");
  const markdown = await readFile(join(output, path, "index.md"), "utf8");
  const sourceBody = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
  const sourceTree = mdxToMdast(sourceBody);
  const published = codeBlocks(markdownToMdast(markdown));
  const bundled = fullSections.get(`https://developer.sumup.com/${path}/`);
  assert(bundled, `${path}: missing from full documentation`);
  const bundledCode = codeBlocks(markdownToMdast(bundled));
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
console.log(
  `Verified ${pages} Markdown pages, ${examples} source code examples, the full documentation bundle, and OpenAPI.`,
);
