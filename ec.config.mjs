import { defineEcConfig } from "astro-expressive-code";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";

export default defineEcConfig({
  plugins: [pluginCollapsibleSections(), pluginLineNumbers()],
  themes: ["github-dark-dimmed", "github-light-default"],
  styleOverrides: {
    codeFontSize: "0.8rem",
    borderColor: "var(--cui-border-subtle)",
    borderRadius: "0",
    borderWidth: "0",
    codeFontFamily: "var(--cui-font-stack-mono)",
    codeBackground: "var(--cui-bg-subtle)",
    gutterBorderWidth: "0",
    frames: {
      editorTabBarBorderBottomColor: "var(--cui-border-subtle)",
      terminalTitlebarBorderBottomColor: "var(--cui-border-subtle)",
      shadowColor: "unset",
    },
  },
  frames: false,
});
