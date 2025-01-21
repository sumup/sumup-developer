interface ImportMeta {
  env: {
    // TODO: add checks for this values:
    // either on build or on server start, whichever makes more sense
    APIGATEWAY_URL: string;
    APPLE_PAY_KEYS_BACKEND_URL: string;
    CLOUDFLARE_SECRET: string;
    MARKETING_CLOUD_AUTH: string;
    MARKETING_CLOUD_URL: string;
    OIDC_CALLBACK: string;
    PUBLIC_GA_TAG_ID: string;
    PUBLIC_OIDC_ISSUER: string;
    PUBLIC_ONETRUST_DOMAIN_ID: string;
  };
}
