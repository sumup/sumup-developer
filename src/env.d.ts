// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly MARKETING_CLOUD_AUTH: string;
  readonly MARKETING_CLOUD_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
