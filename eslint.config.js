import pluginJavaScript from "@eslint/js";
import pluginAstro from "eslint-plugin-astro";
import pluginReactA11y from "eslint-plugin-jsx-a11y-x";
import pluginReact from "eslint-plugin-react-x";
import pluginTypeScript from "typescript-eslint";

import globals from "globals";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  pluginJavaScript.configs.recommended,
  ...pluginTypeScript.configs.recommended,
  ...pluginAstro.configs.recommended,
  ...pluginAstro.configs["jsx-a11y-recommended"],
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx}"],
    ...pluginReact.configs.recommended,
  },
  {
    ...pluginReactA11y.configs.recommended,
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx}"],
  },
  {
    ignores: [".astro/", "dist/", ".wrangler/", ".github/", "skills/"],
  },
  {
    rules: {
      "no-var": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
    },
  },
];
