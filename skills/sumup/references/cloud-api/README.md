# Cloud API (Terminal / Solo)

> Prefer the latest SumUp docs first: `https://developer.sumup.com/terminal-payments/cloud-api/index.md`
> LLM entrypoint for discovery: `https://developer.sumup.com/llms.txt`

## Pair reader (high-level)

1. Generate pairing code on logged-out Solo (`Connections -> API -> Connect`).
2. Call Readers create endpoint with pairing code.
3. Store returned `reader_id`.

If you do not have a physical reader yet, use `https://virtual-solo.sumup.com/` with a sandbox merchant account to test Cloud API flows.

## Start checkout on reader

```bash
curl -X POST \
  https://api.sumup.com/v0.1/merchants/$SUMUP_MERCHANT_CODE/readers/$READER_ID/checkout \
  -H "Authorization: Bearer $SUMUP_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "total_amount": { "currency": "EUR", "minor_unit": 2, "value": 1500 },
    "affiliate": {
      "key": "YOUR_AFFILIATE_KEY",
      "app_id": "com.example.pos",
      "foreign_transaction_id": "order-1001-attempt-1"
    },
    "return_url": "https://example.com/sumup/webhook"
  }'
```

The reader must be online. Checkout acceptance starts an asynchronous operation; it is not payment confirmation. Store `data.client_transaction_id` with the order before awaiting its result.

The callback uses `event_type: "solo.transaction.updated"`, with `payload.client_transaction_id` and status `successful` or `failed`. Correlate the client transaction ID with the accepted checkout and retrieve the transaction for reconciliation. Do not use the deprecated `transaction_id` callback field. A failed result may include free-form `failure_reason`; do not match exact wording or display it directly to customers.

## Terminate checkout

```bash
curl -X POST \
  https://api.sumup.com/v0.1/merchants/$SUMUP_MERCHANT_CODE/readers/$READER_ID/terminate \
  -H "Authorization: Bearer $SUMUP_API_KEY"
```

Termination is only available while the reader is waiting for cardholder action and does not confirm the final payment result. If payment status is uncertain, reconcile the transaction before starting another attempt.

## Reader settings: menu lock

Use `GET` and `PATCH /v0.1/merchants/{merchant_code}/readers/{reader_id}/settings` for a paired Solo running firmware 3.3.44.0 or later.

- A patch requires `menu_lock` with at least one of `enabled` or `passcode`. The passcode is a 4-digit numeric string; include it when first enabling menu lock.
- Omitted settings retain their values. A `200` update response means the reader applied the change; the reader must be online.
- Handle `422` for unsupported models/firmware, an offline reader, or a failed reader action; handle `504` for an action timeout.
- A read returns device-reported settings while online, or the last saved settings while offline. An offline reader with no saved settings returns `404`; saved settings may differ from the device configuration.

See [reader settings](https://developer.sumup.com/terminal-payments/cloud-api/#reader-settings-menu-lock) for the full contract.

## Sandbox tests

Follow [in-person payment testing](https://developer.sumup.com/terminal-payments/testing/): `10.00 EUR` succeeds, `11.00 EUR` declines, and listed `42.xx` amounts simulate specific failures. Convert amounts to minor units for `total_amount.value`. Virtual Solo tests pairing and payment flows; physical-reader and connectivity behavior require separate checks.

## Reading Order

1. This file.
2. `references/webhooks-3ds/README.md` for async verification patterns.
3. `references/checkout-playbook.md` for decision matrix and safeguards.

## See Also

- `references/android-reader-sdk/README.md`
- `references/ios-terminal-sdk/README.md`
- `references/android-tap-to-pay-sdk/README.md`
- `references/payment-switch/README.md`
- `references/checkout-playbook.md`
