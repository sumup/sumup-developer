# Responses and Safe Retries

> Prefer the latest SumUp docs first: `https://developer.sumup.com/online-payments/guides/response-handling/index.md`
> Refund guide: `https://developer.sumup.com/online-payments/guides/refund/index.md`

An HTTP success response is not payment proof. Online checkouts must have `status: "PAID"` before fulfillment. A Cloud API checkout response confirms acceptance; its transaction result arrives asynchronously.

## Uncertain payment results

A timeout, lost connection, or `5xx` can occur after a payment was processed. Do not automatically create a new checkout or repeat the payment.

1. Store the checkout/transaction IDs and payment-attempt reference with the order before processing payment.
2. Retrieve a known checkout ID. If checkout creation returned no ID, list checkouts with the original `checkout_reference` to find the existing resource.
3. For terminal payments, retrieve the transaction using the identifier supplied by the flow, such as `foreign_transaction_id` or `client_transaction_id`.
4. If paid, update the existing order idempotently. If pending or unknown, keep reconciling that attempt.
5. Start another attempt only after checking the previous result; use a new reference linked to the same order.

`checkout_reference` identifies an attempt for reconciliation. Do not assume reusing it provides server-enforced idempotency.

## Retry by operation and response

| Operation or response | Action |
| --- | --- |
| Read request | Retry transient failures with increasing delays and a fixed attempt limit. |
| Payment creation or processing | Retrieve the existing payment before submitting another attempt. |
| Refund | Retrieve the transaction and inspect refund events or refunded amount before repeating the refund. |
| `400` / `422` | Correct the invalid request. |
| `401` / `403` | Resolve authentication, merchant access, or permissions. |
| `409` | Inspect the conflicting resource or reference. |
| `429` | Respect `Retry-After` if present and cap retries. |
| `204` | Do not parse an empty response as JSON. |

If the result remains unknown, retain the identifiers for reconciliation or support. Do not automatically repeat a payment or refund whose result cannot be established.

## See Also

- `references/checkouts-api/README.md`
- `references/cloud-api/README.md`
- `references/webhooks-3ds/README.md`
