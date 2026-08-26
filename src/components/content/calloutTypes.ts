export const CALLOUT_TYPES = [
  "note",
  "tip",
  "caution",
  "success",
  "promo",
] as const;

export type CalloutType = (typeof CALLOUT_TYPES)[number];

export const isCalloutType = (value: string): value is CalloutType =>
  CALLOUT_TYPES.includes(value as CalloutType);
