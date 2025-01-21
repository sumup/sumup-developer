export type Doc = {
  id?: string;
  title: string;
  slug?: string;
  href?: string;
  children?: Doc[];
  parent?: Doc;
};

export const getChildrenBySlug = (tree: Doc[], slug: string): Doc[] => {
  for (const item of tree) {
    if (item.slug === slug) {
      return item.children || [];
    }

    if (item.slug?.startsWith(slug) && item.children) {
      return getChildrenBySlug(item.children, slug);
    }
  }
  return [];
};
