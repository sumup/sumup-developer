import { type Render, component } from "@astrojs/markdoc/config";
import type { Config, Schema } from "@markdoc/markdoc";

export default {
  render: component("./src/components/content/SoloScreen.astro"),
  attributes: {
    src: {
      type: String,
      errorLevel: "critical",
      required: true,
    },
    alt: {
      type: String,
      errorLevel: "critical",
      required: true,
    },
    title: {
      type: String,
      errorLevel: "critical",
    },
  },
} as Schema<Config, Render>;
