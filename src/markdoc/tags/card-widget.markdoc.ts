import { type Render, component } from "@astrojs/markdoc/config";
import type { Config, Schema } from "@markdoc/markdoc";

export default {
  render: component("./src/components/content/CardWidget.astro"),
  selfClosing: true,
} as Schema<Config, Render>;
