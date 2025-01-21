import slugify from "@sindresorhus/slugify";

export const formatSlug = (str = ""): string => {
  return slugify(str);
};
