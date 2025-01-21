import { type Render, component } from "@astrojs/markdoc/config";
import type { Config, Schema } from "@markdoc/markdoc";

export default {
  render: component("./src/components/content/Logo.astro"),
  attributes: {
    title: {
      type: String,
      errorLevel: "critical",
    },
    src: {
      type: String,
      errorLevel: "critical",
    },
  },
  selfClosing: true,
} as Schema<Config, Render>;
