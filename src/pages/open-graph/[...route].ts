import { OGImageRoute } from "astro-og-canvas";
import { getCollection } from "astro:content";

const collectionEntries = await getCollection("docs");

const pages = Object.fromEntries(
  collectionEntries.map(({ id, data }) => [id, data]),
);

export const { getStaticPaths, GET } = OGImageRoute({
  param: "route",
  pages,
  getImageOptions: (path, page) => ({
    title: page.title,
    description: page.description,
    logo: {
      path: "./src/assets/logo_white.png",
      size: [300],
    },
    font: {
      title: {
        weight: "Bold",
        families: ["Inter"],
      },
    },
    fonts: ["https://static.sumup.com/fonts/Inter/Inter-normal-latin.woff2"],
  }),
});
