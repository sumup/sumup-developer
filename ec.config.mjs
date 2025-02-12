import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";

export default {
  plugins: [pluginCollapsibleSections()],
  themes: ["github-dark-dimmed", "github-light-default"],
  styleOverrides: {
    codeFontSize: "0.8rem",
    borderColor: "var(--cui-border-subtle)",
    borderRadius: "var(--cui-border-radius-byte)",
    borderWidth: "var(--cui-border-width-kilo)",
    codeFontFamily: "var(--cui-font-stack-mono)",
    frames: {
      editorTabBarBorderBottomColor: "var(--cui-border-subtle)",
      terminalTitlebarBorderBottomColor: "var(--cui-border-subtle)",
      shadowColor: "unset",
    },
  },
  frames: false,
};
