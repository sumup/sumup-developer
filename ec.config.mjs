import { defineEcConfig } from "astro-expressive-code";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";

export default defineEcConfig({
  plugins: [pluginCollapsibleSections()],
  themes: ["github-dark-dimmed", "github-light-default"],
  styleOverrides: {
    codeFontSize: "0.8rem",
    borderColor: "var(--cui-border-subtle)",
    codeBackground: "var(--cui-bg-subtle)",
    borderRadius: "0",
    borderWidth: "0",
    codeFontFamily: "var(--cui-font-stack-mono)",
    frames: {
      editorTabBarBorderBottomColor: "var(--cui-border-subtle)",
      terminalTitlebarBorderBottomColor: "var(--cui-border-subtle)",
      shadowColor: "unset",
    },
  },
  frames: false,
});
