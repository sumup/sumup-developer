// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly MARKETING_CLOUD_AUTH: string;
  readonly MARKETING_CLOUD_CONTACT_URL: string;
  readonly GA_TAG_ID: string;
  readonly ONETRUST_ENABLED: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
