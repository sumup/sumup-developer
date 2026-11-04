# SumUp Checkout Playbook

> Prefer the latest SumUp docs first: `https://developer.sumup.com/terminal-payments/index.md`
> LLM entrypoint for discovery: `https://developer.sumup.com/llms.txt`

## Contents

1. Integration decision matrix
2. Shared prerequisites
3. Terminal checkout patterns
4. Online checkout patterns
5. 3DS and webhook handling
6. Common pitfalls and safeguards

## 1. Integration Decision Matrix

- Need in-person payment inside a native app:
  - iOS Terminal SDK or Android Reader SDK.
- Need in-person payment from web/desktop/POS backend:
  - Cloud API with Solo reader.
- Need lightweight app handoff on mobile:
  - Payment Switch (opens SumUp app).
- Need fastest secure online flow without embedding UI:
  - Hosted Checkout.
- Need fastest online embed:
  - Card Widget.
- Need save-card/subscription recurring charging:
  - Customers + tokenization flow.
- Need full custom online flow:
  - Checkouts API create + 3DS handling + webhook verification.

## 2. Shared Prerequisites

- Merchant account (or sandbox merchant account).
- Authorization for APIs:
  - API key for single-merchant integrations.
  - OAuth 2.0 for multi-merchant/delegated integrations.
- For card-present integrations, create Affiliate Key and match app ID / bundle ID to key setup.
- Keep credentials secure; never expose a secret key or client secret in public/client code. Supported client checkout SDKs use public `sup_pk_` merchant keys.
- Ensure payment currency matches merchant account currency for checkout calls.

## 3. Terminal Checkout Patterns

### A. iOS / Android Reader SDK

Core sequence:

1. Initialize SDK with app setup.
2. Authenticate merchant in SDK.
3. Optionally call `prepareForCheckout`.
4. Build payment request with amount/currency/title and unique external transaction id.
5. Start checkout and handle callback/result payload.

Useful notes:

- SDK drives payment UI and reader communication.
- SDK integrations require Bluetooth/location permissions per platform requirements.
- Android result includes `RESULT_CODE`, `MESSAGE`, transaction fields.
- iOS returns checkout result and error in completion handler.

### B. Cloud API (Solo)

Use when POS is not a native mobile reader integration.

Reader enrollment:

1. Generate pairing code on logged-out Solo device.
2. Pair reader via Readers API using pairing code.
3. Persist reader identifier for future checkouts.

Payment flow:

1. List/read reader to pick active target.
2. Create reader checkout for merchant + reader.
3. Optionally terminate checkout if still awaiting cardholder action.
4. Use webhooks/API polling to confirm final status.

Important constraints:

- Reader must be online.
- One accepted checkout locks the reader for a short start window.
- Include affiliate metadata in reader checkout request.
- Transaction operations are asynchronous.

### C. Payment Switch

- Legacy lightweight option for mobile/web-on-mobile.
- Your app opens SumUp app to execute payment and receives outcome on return.
- Still requires Affiliate Key and appropriate scopes.

## 4. Online Checkout Patterns

### A0. Hosted Checkout (fastest no-embed path)

Server:

1. Create checkout with `hosted_checkout.enabled = true` (`POST /v0.1/checkouts`).
2. Optionally include `redirect_url`.
3. Store `checkout.id` and `hosted_checkout_url`.

Frontend:

1. Redirect customer to `hosted_checkout_url`.
2. On return via `redirect_url`, show pending/result state only.
3. Confirm final checkout status server-side before order fulfillment.

### A. Card Widget (recommended for fast secure embed)

Server:

1. Create checkout via API (`POST /v0.1/checkouts`).
2. Return `checkoutId` to frontend.

Frontend:

1. Load widget script from `gateway.sumup.com`.
2. Mount widget with `checkoutId`.
3. Handle `onResponse` events (`sent`, `invalid`, `auth-screen`, `error`, `success`, `fail`).
4. On success callback, verify final checkout status server-side.

Notes:

- Widget supports PSD2/SCA and 3DS flows.
- Use HTTPS and configure CSP allowlists/nonces where strict CSP is enabled.
- Payment methods vary by merchant country and APM enablement.

### B. API-Orchestrated Checkout (without direct card entry)

1. Create checkout server-side.
2. Hand off payment entry to Card Widget or SDK-provided checkout UI.
3. Handle 3DS `next_step` when returned by checkout flow.
4. Verify final status via retrieve endpoint and webhooks.

### C. Recurring / Tokenization

1. Create customer (`POST /v0.1/customers`) with your business `customer_id`.
2. Create setup checkout with `purpose: "SETUP_RECURRING_PAYMENT"` and `customer_id`.
3. Complete setup through Card Widget (recommended for consent + 3DS + mandate handling).
4. Retrieve and store `payment_instrument.token`.
5. For later charges, create normal checkout and process with `token + customer_id`. Sandbox merchants can test the widget tokenization and 3DS flow without additional activation.

See `references/recurring-tokenization/README.md` for implementation details and edge cases.

## 5. 3DS and Webhook Handling

### 3DS

- Include `redirect_url` on checkout creation.
- Process checkout and inspect `next_step`.
- If `next_step` exists, post all provided payload params to `next_step.url` using specified method.
- After challenge completion, user returns to `redirect_url` with checkout context.
- Confirm status via checkout retrieval endpoint.

### Webhooks

- For online checkout status notifications, set `return_url` on checkout creation. The callback contains `event_type: "CHECKOUT_STATUS_CHANGED"` and the checkout `id`.
- Reply promptly with an empty `2xx`. The online guide documents retry delays of 1 minute, 5 minutes, 20 minutes, and 2 hours.
- Retrieve the checkout and validate its merchant, reference, amount, currency, and `PAID` status before fulfillment. The published online callback protocol does not specify HMAC signatures.
- Cloud API has a separate `solo.transaction.updated` callback. Match `payload.client_transaction_id` and reconcile the transaction result; an accepted checkout is not payment confirmation.
- Apply any signature checks only when documented for the selected product. Do not treat the draft dashboard webhook guide as an available online checkout feature.
- Make order updates idempotent across repeated callbacks and status reads.

### Safe retries

A timeout or `5xx` can leave a payment or refund result uncertain. Retrieve the existing resource before repeating the operation. If checkout creation returned no ID, list checkouts with the original `checkout_reference`. Keep an unresolved attempt under reconciliation; give any confirmed new payment attempt a new reference linked to the same order.

For refunds, inspect transaction refund events or the refunded amount before submitting another refund. See `references/response-handling/README.md` for the full recovery flow.

## 6. Common Pitfalls and Safeguards

- Missing `payments` scope:
  - Request activation from SumUp for restricted scopes.
- Invalid affiliate setup:
  - Ensure Affiliate Key and app identifier match integration app IDs.
- Duplicate transaction IDs:
  - Generate stable unique references (UUID/order ID strategy).
- Merchant currency mismatch:
  - Validate currency before checkout creation.
- Treating widget callback success as fully settled:
  - Confirm with backend checkout retrieval/webhook.
- Poor idempotency on webhook retries:
  - Store processed event/checkouts and deduplicate updates.
