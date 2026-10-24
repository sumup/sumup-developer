/** @type {import("prettier").Config} */
export default {
  plugins: ["prettier-plugin-astro"],
  overrides: [
    {
      files: ["*.md", "*.mdx"],
      options: {
        proseWrap: "preserve",
        embeddedLanguageFormatting: "off",
      },
    },
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
};
