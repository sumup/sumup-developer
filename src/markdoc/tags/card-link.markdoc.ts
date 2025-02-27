import { type Render, component } from "@astrojs/markdoc/config";
import type { Config, Schema } from "@markdoc/markdoc";

export default {
  render: component("./src/components/CardLink.astro"),
  attributes: {
    href: {
      type: String,
      errorLevel: "critical",
      required: true,
    },
    title: {
      type: String,
      errorLevel: "critical",
      required: true,
    },
    description: {
      type: String,
      errorLevel: "critical",
      required: true,
    },
    image: {
      type: String,
      errorLevel: "critical",
      required: true,
    },
  },
  selfClosing: true,
} as Schema<Config, Render>;
