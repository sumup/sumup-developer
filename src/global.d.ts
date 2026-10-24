declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer: any[];
    __applyPortalTheme?: () => void;
  }
}

export {};
