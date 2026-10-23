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
    "total_amount": { "currency": "EUR", "minor_unit": 2, "value": 1500 }
  }'
```

## Terminate checkout

```bash
curl -X POST \
  https://api.sumup.com/v0.1/merchants/$SUMUP_MERCHANT_CODE/readers/$READER_ID/terminate \
  -H "Authorization: Bearer $SUMUP_API_KEY"
```

Use webhook/API status checks for final transaction state.

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
