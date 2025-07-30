import { type Render, component } from "@astrojs/markdoc/config";
import type { Config, Schema } from "@markdoc/markdoc";

export default {
  render: component("./src/components/content/Video.astro"),
  attributes: {
    src: {
      type: String,
      required: true,
      errorLevel: "critical",
    },
    trackSrc: {
      type: String,
      required: true,
      errorLevel: "critical",
    },
    controls: {
      type: Boolean,
    },
    autoplay: {
      type: Boolean,
    },
    loop: {
      type: Boolean,
    },
    width: {
      type: String,
    },
    height: {
      type: String,
    },
  },
} as Schema<Config, Render>;
