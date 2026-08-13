import { mdxToMdast } from "satteri";
import type { RootContent } from "mdast";

// Nimbus 0.15 strips four spaces from fenced code and retains MDX imports.
// Correct only those losses using the authored AST; leave its routing,
// discovery, component conversion, and publication filtering to Nimbus.
export function markdownCleaner(sources: string[]) {
  const snippets = new Map<string, string>();
  const syntax = new Set<string>();
  for (const source of sources) {
    const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
    const tree = mdxToMdast(body);
    const visit = (node: RootContent) => {
      const start = node.position?.start.offset;
      const end = node.position?.end.offset;
      const raw =
        start !== undefined && end !== undefined ? body.slice(start, end) : "";
      if (node.type === "code" && raw.startsWith("```")) {
        const content = raw.slice(
          raw.indexOf("\n") + 1,
          raw.lastIndexOf("```"),
        );
        const key = `\n${content}`
          .replace(/\n[ \t]{4}/g, "\n")
          .replace(/\n{3,}/g, "\n\n")
          .trim();
        const existing = snippets.get(key);
        if (existing !== undefined && existing !== node.value) {
          throw new Error(
            "Ambiguous Markdown code correction; review the source examples.",
          );
        }
        snippets.set(key, node.value);
      } else if (
        node.type === "mdxjsEsm" ||
        (node.type === "mdxFlowExpression" && /^\s*\/\*/.test(node.value))
      ) {
        syntax.add(raw);
      }
      if ("children" in node) node.children.forEach(visit);
    };
    if (tree.type !== "root") throw new Error("Expected an MDX document root");
    tree.children.forEach(visit);
  }
  return (markdown: string) =>
    markdown
      .split(/(```[^\n]*\n[\s\S]*?```)/g)
      .map((part, index) => {
        if (index % 2 === 1) {
          const openingEnd = part.indexOf("\n");
          const original = snippets.get(part.slice(openingEnd + 1, -3).trim());
          return original === undefined
            ? part
            : `${part.slice(0, openingEnd)}\n${original}\n\`\`\``;
        }
        for (const statement of syntax) part = part.replaceAll(statement, "");
        return part.replace(/\n{3,}/g, "\n\n");
      })
      .join("");
}
