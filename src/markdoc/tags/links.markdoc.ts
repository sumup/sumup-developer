import { type Render, component } from "@astrojs/markdoc/config";
import type { Config, Schema } from "@markdoc/markdoc";

export default {
  render: component("./src/components/content/Links.astro"),
  children: ["articlelink"],
} as Schema<Config, Render>;
