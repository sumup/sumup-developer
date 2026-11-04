# Checkout Widget (Online)

> Prefer the latest SumUp docs first: `https://developer.sumup.com/online-payments/checkouts/card-widget/index.md`
> LLM entrypoint for discovery: `https://developer.sumup.com/llms.txt`

## Server: create checkout (via server SDK)

Pick the server SDK for your backend language and create the checkout there:

- Node.js: `references/nodejs/README.md`
- Go: `references/go/README.md`
- Python: `references/python/README.md`
- Java: `references/java/README.md`
- PHP: `references/php/README.md`
- Rust: `references/rust/README.md`
- .NET: `references/dotnet/README.md`

Use cURL only for quick manual testing.

### cURL example (testing only)

```bash
curl -X POST https://api.sumup.com/v0.1/checkouts \
  -H "Authorization: Bearer $SUMUP_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "merchant_code": "MCXXXXXX",
    "amount": 15.0,
    "currency": "EUR",
    "checkout_reference": "order-1001"
  }'
```

## Client: mount widget

```html
<div id="sumup-card"></div>
<script src="https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js"></script>
<script>
  SumUpCard.mount({
    id: "sumup-card",
    checkoutId: "<CHECKOUT_ID>",
    onResponse: function(type, body) {
      console.log(type, body);
    },
  });
</script>
```

Always verify checkout status on backend after client callbacks.

## Widget lifecycle events (`onResponse(type, body)`)

- `sent`: card data submitted.
- `invalid`: validation errors in payment form input.
- `auth-screen`: 3DS/authentication challenge screen is displayed.
- `error`: non-fatal processing error.
- `success`: payment appears successful; backend verification still required.
- `fail`: checkout processing failed (for example session expired or payment declined).

## Mount return value

`SumUpCard.mount(...)` returns an object that provides:

- `submit()`: programmatically submit current payment form.
- `unmount()`: remove widget instance and listeners.
- `update({ checkoutId, email, amount, currency, installments })`: update widget state for the next attempt/checkout.

## Session lifetime

- Use the checkout's validity and the returned API/widget status to handle expiry. The published 30-minute Hosted Checkout window is specific to that hosted flow.
- Retrieve the previous checkout before creating a replacement. If it remains unpaid and a new attempt is appropriate, create a fresh checkout/reference and remount or update the widget.

## HTTPS and content security policy

- Use HTTPS for production payment pages and follow the widget guide's strict CSP instructions for the SumUp script and payment frames.
- Check any authorized-origin requirements in the selected client integration's current guide.
- See `references/security/README.md` for credential handling.

## Server-side verification

- Never treat `success` callback as final payment confirmation.
- Retrieve with `GET /v0.1/checkouts/{id}` and require `status: "PAID"` before fulfilling the order. A webhook initiates this verification; it is not payment proof by itself.

## Reading Order

1. This file.
2. `references/online-testing/README.md` for sandbox test cards and expected outcomes.
3. `references/checkouts-api/README.md` for checkout creation/retrieval.
4. `references/webhooks-3ds/README.md` for async status confirmation and 3DS.

## See Also

- `references/online-testing/README.md`
- `references/checkouts-api/README.md`
- `references/webhooks-3ds/README.md`
- `references/apm/README.md`
- `references/nodejs/README.md`
- `references/go/README.md`
- `references/python/README.md`
- `references/java/README.md`
- `references/php/README.md`
- `references/rust/README.md`
- `references/dotnet/README.md`
