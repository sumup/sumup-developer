# Webhooks and 3DS

> Prefer the latest SumUp docs first: `https://developer.sumup.com/online-payments/webhooks/index.md`
> LLM entrypoint for discovery: `https://developer.sumup.com/llms.txt`

## 3DS flow

1. Include `redirect_url` on checkout creation.
2. Let the Payment Widget or selected checkout SDK handle authentication. For API-orchestrated flows, inspect `next_step` and follow its method, URL, and complete payload.
3. After the challenge, retrieve the checkout on your backend and require `status: "PAID"` before fulfillment.

## Online checkout callbacks

Set `return_url` when creating a checkout. SumUp sends an HTTP POST when the checkout status changes:

```json
{
  "event_type": "CHECKOUT_STATUS_CHANGED",
  "id": "id-of-the-changed-checkout"
}
```

- Respond promptly with an empty `2xx` response.
- Retrieve the checkout with `GET /v0.1/checkouts/{id}` and verify the expected merchant, amount, currency, reference, and final status before updating the order.
- Make order updates idempotent. This payload has a checkout ID, not a separate delivery ID; repeated notifications must not trigger duplicate fulfillment.
- Ignore unknown event types.
- The documented retry delays are 1 minute, 5 minutes, 20 minutes, and 2 hours.

The published online checkout guide does not specify a signing header or a webhook-secret setup. Do not require `x-payload-signature` for this callback or present the draft dashboard webhook-subscription guide as an available checkout integration. If a different SumUp product explicitly documents signed webhooks, follow that product's signature protocol.

## Cloud API callbacks

Cloud API uses a separate `solo.transaction.updated` event. Match `payload.client_transaction_id` to the identifier returned when starting the reader checkout; `transaction_id` is deprecated. Its status is `successful` or `failed`, rather than the online checkout status enum.

Use [the Cloud API result flow](https://developer.sumup.com/terminal-payments/cloud-api/#receive-transaction-results) and transaction retrieval for reconciliation. An accepted reader checkout is not a completed payment.

## Reading Order

1. This file.
2. `references/checkouts-api/README.md` for online checkout retrieval.
3. `references/cloud-api/README.md` for reader transaction results.
4. `references/response-handling/README.md` before retrying uncertain payments or refunds.

## See Also

- `references/online-testing/README.md`
- `references/checkout-widget/README.md`
- `references/react-native-sdk/README.md`
- `references/swift-checkout-sdk/README.md`
