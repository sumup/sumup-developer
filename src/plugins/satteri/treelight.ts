import { satteriHighlightPlugin } from "@astrojs/markdown-satteri";
import rehypeTreelight from "@treelight/plugin-rehype";
import { unified } from "unified";
import type { Root } from "hast";
import {
  treelightHighlighter,
  treelightLanguageMap,
  treelightTheme,
} from "../../lib/treelight";

const highlighter = unified().use(rehypeTreelight, {
  copyButton: true,
  highlighter: treelightHighlighter,
  languageMap: treelightLanguageMap,
  lineNumbers: true,
  theme: treelightTheme.id,
});

// Keep the Astro Code component and authored code fences on the same renderer.
export default satteriHighlightPlugin(async (code, language, meta) => {
  const root: Root = {
    type: "root",
    children: [
      {
        type: "element",
        tagName: "pre",
        properties: {},
        children: [
          {
            type: "element",
            tagName: "code",
            properties: {
              className: [`language-${language}`],
              "data-meta": meta,
            },
            children: [{ type: "text", value: code }],
          },
        ],
      },
    ],
  };
  const highlighted = await highlighter.run(root);
  return highlighted.children[0];
}, undefined);
