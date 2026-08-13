import bash from "@treelight/bash";
import c from "@treelight/c";
import cSharp from "@treelight/c-sharp";
import {
  createHighlighter,
  type ThemeDefinition,
  type ThemeStyle,
} from "@treelight/core";
import css from "@treelight/css";
import go from "@treelight/go";
import graphql from "@treelight/graphql";
import html from "@treelight/html";
import java from "@treelight/java";
import javascript from "@treelight/javascript";
import json from "@treelight/json";
import kotlin from "@treelight/kotlin";
import php from "@treelight/php";
import python from "@treelight/python";
import ruby from "@treelight/ruby";
import rust from "@treelight/rust";
import swift from "@treelight/swift";
import githubDark from "@treelight/theme-github-dark";
import githubLight from "@treelight/theme-github-light";
import typescript from "@treelight/typescript";
import xml from "@treelight/xml";
import yaml from "@treelight/yaml";

function asStyle(style: ThemeStyle | string | undefined): ThemeStyle {
  return typeof style === "string" ? { fg: style } : (style ?? {});
}

function adaptiveColor(light?: string, dark?: string) {
  if (!light || !dark || light === dark) {
    return light ?? dark;
  }

  return `light-dark(${light}, ${dark})`;
}

function createAdaptiveTheme(
  light: ThemeDefinition,
  dark: ThemeDefinition,
): ThemeDefinition {
  const names = new Set([
    ...Object.keys(light.styles),
    ...Object.keys(dark.styles),
  ]);

  return {
    id: "github-adaptive",
    styles: Object.fromEntries(
      [...names].map((name) => {
        const lightStyle = asStyle(light.styles[name]);
        const darkStyle = asStyle(dark.styles[name]);

        return [
          name,
          {
            fg: adaptiveColor(lightStyle.fg, darkStyle.fg),
            bg: adaptiveColor(lightStyle.bg, darkStyle.bg),
            modifiers: lightStyle.modifiers ?? darkStyle.modifiers,
            underline:
              lightStyle.underline || darkStyle.underline
                ? {
                    color: adaptiveColor(
                      lightStyle.underline?.color,
                      darkStyle.underline?.color,
                    ),
                    style:
                      lightStyle.underline?.style ?? darkStyle.underline?.style,
                  }
                : undefined,
          } satisfies ThemeStyle,
        ];
      }),
    ),
  };
}

export const treelightLanguageMap = {
  cs: "c-sharp",
  csharp: "c-sharp",
  groovy: "java",
  http: "text",
  js: "javascript",
  objc: "c",
  py: "python",
  rs: "rust",
  sh: "bash",
  shell: "bash",
  ts: "typescript",
  yml: "yaml",
  zsh: "bash",
};

export const treelightTheme = createAdaptiveTheme(githubLight, githubDark);

export const treelightHighlighter = createHighlighter({
  languages: [
    bash,
    c,
    cSharp,
    css,
    go,
    graphql,
    html,
    java,
    javascript,
    json,
    kotlin,
    php,
    python,
    ruby,
    rust,
    swift,
    typescript,
    xml,
    yaml,
  ],
  themes: [treelightTheme],
});
