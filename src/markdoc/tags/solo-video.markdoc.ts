import { type Render, component } from "@astrojs/markdoc/config";
import type { Config, Schema } from "@markdoc/markdoc";

export default {
  render: component("./src/components/content/SoloVideo.astro"),
  attributes: {
    src: {
      type: String,
      errorLevel: "critical",
      required: true,
    },
    controls: {
      type: Boolean,
      errorLevel: "critical",
    },
    autoplay: {
      type: Boolean,
      errorLevel: "critical",
    },
    loop: {
      type: Boolean,
      errorLevel: "critical",
    }
  ,
  },
} as Schema<Config, Render>;