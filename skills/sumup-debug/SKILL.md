---
name: sumup-debug
description: Troubleshoot common SumUp integration failures. Use when SumUp HMAC signature checks fail, checkout sessions expire, scopes aren't activated, widget mount is blocked, affiliate keys don't match, or `checkout_reference` collides.
license: Apache-2.0
---

# SumUp Troubleshooting Playbook

Use this skill for diagnosis and remediation of failing SumUp integrations.

## Fast Triage Matrix

1. Classify symptom:
   - Auth/signature error
   - Checkout creation/processing error
   - Widget/client-side mount or flow error
   - Async mismatch (success in UI, failure in backend state)
2. Capture evidence:
   - request/response payloads (sanitized), HTTP status, error code/message
   - checkout id, merchant code, `checkout_reference`
   - webhook delivery id and signature verdict
3. Reproduce in sandbox before changing production behavior.

## Common Failures and Fixes

### HMAC signature mismatch (`x-payload-signature`)

Symptoms:

- Webhook verification fails for all events or intermittently.

Likely causes:

- Body parser mutates payload before verification.
- Wrong webhook secret/environment pair.
- Digest computed with non-raw body bytes.

Fix:

- Verify against raw request body bytes.
- Ensure HMAC SHA-256 with exact configured secret.
- Confirm secret belongs to the same merchant/environment.

Verify:

- Signature validation passes for replayed payload and for live sandbox webhook.

### Expired checkout/session window

Symptoms:

- Payment attempt fails after delay, stale checkout status, or timeout flow.

Likely causes:

- Checkout left pending beyond validity window.
- Frontend retries with expired checkout id.

Fix:

- Create a new checkout for each retry attempt.
- Add frontend timeout handling that requests a fresh checkout.

Verify:

- Retried flow always uses new checkout id/reference and succeeds in sandbox.

### Missing scope activation or auth mismatch

Symptoms:

- 401/403 responses despite valid credentials.

Likely causes:

- Missing `payments` or other required scope.
- API key used where OAuth is required, or vice versa.

Fix:

- Confirm auth model for integration type.
- Request/enable required scopes and re-issue token/key as needed.

Verify:

- Previously failing endpoint succeeds with least-privilege valid credentials.

### Currency and merchant mismatch

Symptoms:

- Checkout rejected for currency or merchant constraints.

Likely causes:

- Checkout currency not enabled for merchant.
- Wrong merchant selected in multi-merchant context.

Fix:

- Validate merchant and currency before checkout creation.
- Enforce mapping rules in backend validation layer.

Verify:

- Invalid combinations are blocked early; valid combinations process.

### Affiliate key / app identifier mismatch

Symptoms:

- Card-present flows fail or cannot initialize correctly.

Likely causes:

- Bundle ID/app ID does not match affiliate key configuration.
- Missing affiliate metadata in card-present requests.

Fix:

- Align app identifiers with affiliate key setup.
- Include required affiliate data for terminal/cloud flows.

Verify:

- Device/reader checkout path initializes and completes in sandbox/test device.

### Duplicate `checkout_reference`

Symptoms:

- Duplicate or conflicting checkout outcomes, reconciliation confusion.

Likely causes:

- Non-unique reference generation.
- Retry logic reuses stale reference without idempotency safeguards.

Fix:

- Generate unique deterministic references per logical payment intent.
- Add duplicate detection and safe retry behavior.

Verify:

- Duplicate attempts are rejected or reconciled without double fulfillment.

### Card Widget blocked or not mounting

Symptoms:

- Widget fails to render or emits `error`/init failures.

Likely causes:

- Script blocked by CSP or domain policy.
- Invalid checkout id or environment mismatch.
- Frontend initialization race conditions.

Fix:

- Allow required SumUp script origin in CSP and JS origins config.
- Confirm checkout id environment and lifecycle.
- Mount only after script load and DOM ready.

Verify:

- Widget consistently mounts and can complete test payments.

## Required Response Contract

For each debugging answer, include:

1. Most likely root cause ranked by confidence.
2. Minimal reproducible check to confirm/disprove each hypothesis.
3. Exact fix steps with low-risk rollout advice.
4. Post-fix verification checklist.
5. Any monitoring/logging improvements to prevent recurrence.
