/// <reference types="./global.d.ts" />
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="vitest" />

interface ImportMetaEnv {
  readonly PUBLIC_OIDC_ISSUER: string;
  readonly OIDC_CALLBACK: string;
  readonly CLOUDFLARE_SECRET: string;
  readonly MARKETING_CLOUD_AUTH: string;
  readonly MARKETING_CLOUD_URL: string;
  readonly APIGATEWAY_URL: string;
  readonly APPLE_PAY_KEYS_BACKEND_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
