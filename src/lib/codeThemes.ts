import light from "@pierre/theme/pierre-light-vibrant";
import dark from "@pierre/theme/pierre-dark-vibrant";

// Shiki uses TextMate tokens; Pierre's editor-only semantic tokens have a
// broader type than Shiki accepts and are not needed for highlighting.
function shikiTheme(theme: typeof light) {
  return {
    name: theme.name,
    type: theme.type,
    colors: { ...theme.colors },
    tokenColors: [...theme.tokenColors],
  };
}

export const codeThemes = {
  light: shikiTheme(light),
  dark: shikiTheme(dark),
};
