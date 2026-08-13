import { describe, expect, it } from "vitest";
import { markdownCleaner } from "./cleanMarkdown";

describe("published Markdown", () => {
  it("restores Python indentation and removes authoring imports without changing code imports", () => {
    const source =
      'import Widget from "./Widget.astro";\n\n```py\nimport os\nasync def checkout():\n    if True:\n        return os.environ["KEY"]\n```';
    const output =
      'import Widget from "./Widget.astro";\n\n```py\nimport os\nasync def checkout():\nif True:\n    return os.environ["KEY"]\n```';
    expect(markdownCleaner([source])(output).trim()).toBe(
      '```py\nimport os\nasync def checkout():\n    if True:\n        return os.environ["KEY"]\n```',
    );
  });

  it("preserves generated snippets and removes MDX comments outside code", () => {
    const source =
      '{/* Authoring note */}\n\n```js\nimport Widget from "./Widget.astro";\n```';
    const generated =
      "```xml\n<dependency>\n  <version>1.2.3</version>\n</dependency>\n```";
    const result = markdownCleaner([source])(`${source}\n\n${generated}`);
    expect(result).not.toContain("Authoring note");
    expect(result).toContain('import Widget from "./Widget.astro";');
    expect(result).toContain(generated);
  });

  it("preserves indentation in examples nested inside a list", () => {
    const source =
      "1. Run this:\n\n   ```py\n   def run():\n       return 1\n   ```";
    const output = "1. Run this:\n\n```py\n   def run():\n   return 1\n```";
    expect(markdownCleaner([source])(output)).toContain(
      "```py\ndef run():\n    return 1\n```",
    );
  });
});
