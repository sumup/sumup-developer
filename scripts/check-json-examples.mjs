import { glob, readFile } from "node:fs/promises";
import { mdxToMdast } from "satteri";

export function validateJsonExamples(source, path) {
  const errors = [];
  let checked = 0;
  // Keep source line numbers while removing frontmatter from the MDX parser input.
  const content = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, (header) =>
    header.replace(/[^\n]/g, ""),
  );
  const validate = (value, line, kind) => {
    checked++;
    try {
      JSON.parse(value);
    } catch (error) {
      errors.push(`${path}:${line}: invalid ${kind}: ${error.message}`);
    }
  };
  const visit = (node) => {
    if (node.type === "code") {
      const line = (node.position?.start.line ?? 0) + 1;
      if (node.lang === "json") validate(node.value, line, "JSON example");
      if (
        ["bash", "sh", "shell"].includes(node.lang) &&
        /\bcurl\b/.test(node.value)
      ) {
        // Single-quoted data is literal JSON, unlike an interpolated shell string.
        const bodies = node.value.matchAll(
          /(?:^|\s)(?:-d|--data(?:-raw|-binary)?)\s+'([^']*)'/g,
        );
        for (const body of bodies) {
          if (!["{", "["].includes(body[1].trimStart()[0])) continue;
          const bodyLine =
            line + node.value.slice(0, body.index).split("\n").length - 1;
          validate(body[1], bodyLine, "curl JSON body");
        }
      }
    }
    node.children?.forEach(visit);
  };
  visit(mdxToMdast(content));
  return { checked, errors };
}

if (import.meta.main) {
  let checked = 0;
  const errors = [];
  for await (const path of glob("src/content/**/*.mdx")) {
    const result = validateJsonExamples(await readFile(path, "utf8"), path);
    checked += result.checked;
    errors.push(...result.errors);
  }
  if (errors.length) throw new Error(errors.sort().join("\n"));
  console.log(
    `Validated ${checked} JSON examples and literal curl JSON bodies.`,
  );
}
