# Webhooks and 3DS

> Prefer the latest SumUp docs first: `https://developer.sumup.com/online-payments/webhooks/index.md`
> LLM entrypoint for discovery: `https://developer.sumup.com/llms.txt`

## 3DS flow

1. Include `redirect_url` on checkout creation.
2. Process checkout and inspect `next_step`.
3. Redirect/post customer to `next_step.url` with full `next_step.payload`.
4. After challenge, verify status using retrieve-checkout API.

## Per-checkout server callback (`return_url`)

- Set `return_url` when creating a checkout.
- SumUp sends checkout status-change notifications to this URL.
- Respond quickly with empty `2xx`.
- Use this path for simpler checkout-specific callback handling where global subscriptions are not required.

## Dashboard-registered webhooks (HMAC-signed)

- Register webhook endpoint in Developer Settings.
- SumUp signs payloads in `x-payload-signature` using HMAC SHA-256 over the raw request body and your webhook secret.
- Verify signatures against raw bytes, not parsed JSON.
- Delivery retries can occur (up to 9 retries with exponential backoff).
- Use this model for global event-driven workflows (settlement, refunds, recurring renewals).

### Critical pitfall: raw body is required

- Middleware/framework JSON parsing changes payload bytes and can invalidate signature checks.
- Use raw body access in your stack (for example `req.rawBody` in Express or `request.arrayBuffer()` in Next.js Route Handlers).

### Node verification snippet

```ts
import crypto from "node:crypto";

const expected = crypto
  .createHmac("sha256", process.env.SUMUP_WEBHOOK_SECRET!)
  .update(rawBody) // Buffer of raw bytes, NOT parsed JSON
  .digest("hex");

const ok = crypto.timingSafeEqual(
  Buffer.from(expected),
  Buffer.from(req.headers["x-payload-signature"] as string),
);
```

## Common requirements (both webhook mechanisms)

- Treat callbacks/events as signals only.
- Reconcile final state with `GET /v0.1/checkouts/{id}` before finalizing orders.
- Implement idempotency and deduplicate using event identifiers/checkout state transitions.

## UK payment initiation variant

For SumUp UK payment initiation flows, signature verification can use ED25519 (`token-signature` header) with public key material from the dashboard.

## Reading Order

1. This file.
2. `references/checkouts-api/README.md` for checkout lifecycle API calls.
3. `references/checkout-widget/README.md` for frontend callback integration.

## See Also

- `references/online-testing/README.md`
- `references/checkouts-api/README.md`
- `references/checkout-widget/README.md`
- `references/react-native-sdk/README.md`
- `references/swift-checkout-sdk/README.md`
