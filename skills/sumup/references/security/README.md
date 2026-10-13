# Security and Authorization

> Prefer the latest SumUp docs first: `https://developer.sumup.com/tools/authorization/index.md`
> LLM entrypoint for discovery: `https://developer.sumup.com/llms.txt`

## API key tiers

- `sup_sk_test_*`: sandbox secret key for test environments.
- `sup_sk_live_*`: production secret key.
- Restricted API keys (scoped access) are preferred for production deployments.

Never expose `sup_sk_*` keys in browser code, mobile binaries, or public repositories.

## OAuth 2.0 flows

### Authorization Code (merchant-delegated)

- Authorize endpoint: `https://api.sumup.com/authorize`
- Token endpoint: `https://api.sumup.com/token`
- Use for merchant-consented delegated access.
- Always validate OAuth `state`.
- Use PKCE for public clients (browser/mobile/native apps).

### Client Credentials (machine-to-machine)

- Token endpoint: `https://api.sumup.com/token`
- Use for backend service-to-service calls under your own app credentials.
- No refresh token; request a new token when expired.
- Not suitable for merchant-specific delegated resources.

## Scopes

- `payments`: required for checkout APIs.
- `payment_instruments`: required for tokenization/payment instrument APIs.
  - This scope must be activated by SumUp (request via support/contact form).

## Authorized JavaScript origins

For Card Widget and similar browser integrations, list every allowed staging and production domain in client credentials configuration.
If origin is not listed, widget mount/init can fail.

## Affiliate Keys (card-present)

Affiliate Key configuration must match the app identifier (bundle ID/package/app ID) used by your terminal integration.

## Security don'ts

- Never store or log raw PAN/CVV.
- Never trust Card Widget `success` callback as final payment proof.
- Never trust Hosted Checkout `redirect_url` callback as final payment proof.
- Always reconcile payment status server-side via API reads and/or webhooks.

## Key rotation

Rotate keys with zero downtime:

1. Issue new restricted key.
2. Deploy/update all consumers to use the new key.
3. Revoke old key only after successful cutover.

## Reading Order

1. This file.
2. `references/checkout-widget/README.md` for browser origin and callback handling.
3. `references/webhooks-3ds/README.md` for HMAC signature verification and raw body handling.
4. `references/checkouts-api/README.md` for server-side verification endpoints.

## See Also

- `references/checkout-widget/README.md`
- `references/webhooks-3ds/README.md`
- `references/checkouts-api/README.md`
