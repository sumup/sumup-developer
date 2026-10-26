import type { ApiConstraint, ApiFieldView } from "@cloudflare/nimbus-docs/api";

export const constraintPairs = (constraints?: ApiConstraint) =>
  Object.entries(constraints ?? {}).filter(([, value]) => value !== undefined);

export const isExpandable = (field: ApiFieldView): boolean =>
  Boolean(field.union || field.children.length || field.truncated);

export const displayValue = (value: unknown): string => JSON.stringify(value);
