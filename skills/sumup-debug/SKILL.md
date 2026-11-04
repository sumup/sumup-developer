---
name: sumup-debug
description: Diagnose and fix failing SumUp payment integrations, including checkout errors, callback verification, widget mounting, merchant or currency mismatches, missing scopes, affiliate setup, and uncertain or duplicate payments. MCP connection setup belongs to sumup-mcp.
license: Apache-2.0
---

# Debug a SumUp Integration

Trace the reported failure before changing the integration. Inspect available code, the exact error, and sanitized request/response evidence; distinguish a confirmed cause from a hypothesis. Use the [current documentation index](https://developer.sumup.com/llms.txt) and the installed SDK's types to verify the affected contract.

## Gather only the evidence needed

Identify the channel (online checkout, widget, SDK, or Cloud API), authenticated merchant, and payment attempt. Useful correlation fields are checkout ID, `checkout_reference`, transaction ID/code, `client_transaction_id`, timestamps, HTTP status, and the returned error. Do not request raw card data, secrets, or full tokens.

Use a sanitized reproducer or sandbox where practical. Do not require a new sandbox setup before inspecting an existing failure, or invent a root cause when evidence is missing.

## Investigate by symptom

| Symptom | Check and recovery |
| --- | --- |
| `401` / `403` | Verify credential type, expiry, authenticated merchant, granted permissions, and any required OAuth scope verification. API keys and OAuth have different setup requirements. |
| Missing signing header or unexpected callback | Online notifications contain `CHECKOUT_STATUS_CHANGED` and checkout `id`; their published protocol does not specify HMAC signing. Retrieve the checkout and validate its expected identity, amount, currency, and final status. |
| Cloud API accepted checkout but order state differs | Acceptance is not payment success. Correlate `solo.transaction.updated` using `payload.client_transaction_id`, then reconcile the transaction. Do not substitute the online checkout status enum. |
| Timeout, `5xx`, lost result, or session expiry | Retrieve the original payment first. If checkout creation returned no ID, list checkouts with the original `checkout_reference`. Keep pending or unknown results under reconciliation; start a new attempt only after checking the previous result. |
| Duplicate attempts or fulfillment | Trace references and state transitions. Use a distinct reference per confirmed new attempt and make order updates idempotent. Do not assume a reused reference prevents a second charge. |
| Merchant/currency rejection | Compare the actual credential, checkout merchant, and supported currency with the order; do not rely on the merchant selected in the Dashboard. |
| Terminal initialization or affiliate errors | Match Affiliate Key to the app/package identifier and include the metadata required by the selected SDK or Cloud API. Android Tap-to-Pay is a separate SDK. |
| Widget fails to mount | Check script loading, HTTPS/CSP, DOM readiness, checkout validity, and any origin settings documented for that integration. Inspect the actual browser error. |

For callback handling, see [online webhooks](https://developer.sumup.com/online-payments/webhooks/) and [Cloud API results](https://developer.sumup.com/terminal-payments/cloud-api/#receive-transaction-results). For uncertain mutations, use the [payment and refund recovery guide](https://developer.sumup.com/online-payments/guides/response-handling/). Apply signature checks only where that product's current protocol requires them.

## Fix and verify

Change the smallest part supported by the evidence. Recheck the failing path and any affected payment-state transition; verify repeated notifications cannot repeat fulfillment and an uncertain payment is not charged again. Use the project's tests and relevant sandbox/device checks, and distinguish local results from live-provider behavior.

Lead with the finding or the next check that will resolve the uncertainty. Include rollout or monitoring changes when the fix warrants them; a small diagnostic question does not need a full playbook.
