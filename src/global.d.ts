declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer: any[];
    __applyPortalTheme?: () => void;
  }
}

declare module "*.woff" {
  const data: Uint8Array;
  export default data;
}

declare module "*.woff2" {
  const data: Uint8Array;
  export default data;
}

declare module "*.ttf" {
  const data: Uint8Array;
  export default data;
}

declare module "*.otf" {
  const data: Uint8Array;
  export default data;
}

declare module "*.png?bytes" {
  const data: Uint8Array;
  export default data;
}

export {};
