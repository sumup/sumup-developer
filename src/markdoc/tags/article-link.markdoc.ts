import { type Render, component } from "@astrojs/markdoc/config";
import type { Config, Schema } from "@markdoc/markdoc";

export default {
  render: component("./src/components/content/ArticleLink.astro"),
  attributes: {
    collection: {
      type: String,
      matches: ["online-payments", "terminal-payments"],
      errorLevel: "critical",
    },
    doc: {
      type: String,
      errorLevel: "critical",
    },
  },
} as Schema<Config, Render>;
