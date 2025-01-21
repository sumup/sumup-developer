import { defineMarkdocConfig } from "@astrojs/markdoc/config";
import starlightMarkdoc from "@astrojs/starlight-markdoc";

import * as tags from "./src/markdoc/tags";

// https://www.anca.io/posts/adding-necessary-features-in-the-astro-markdoc-blog/
export default defineMarkdocConfig({
  tags,
  extends: [starlightMarkdoc()],
});
