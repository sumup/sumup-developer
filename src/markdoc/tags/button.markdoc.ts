import { type Render, component } from "@astrojs/markdoc/config";
import Markdoc, { type Config, type Schema } from "@markdoc/markdoc";

export default {
  render: component("./src/components/content/Button.astro"),
  attributes: {
    variant: {
      type: String,
      default: "note",
      matches: ["info", "tip", "caution", "note"],
      errorLevel: "critical",
    },
    href: {
      type: String,
      errorLevel: "critical",
    },
  },
  transform(node, config) {
    const attrs = node.transformAttributes(config);
    return new Markdoc.Tag(
      this.render as "button",
      attrs,
      // @ts-expect-error :shrug:
      node.children[0].children[0].transform(config),
    );
  },
} satisfies Schema<Config, Render>;
