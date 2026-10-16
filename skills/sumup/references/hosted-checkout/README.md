# Hosted Checkout (Online)

> Prefer the latest SumUp docs first: `https://developer.sumup.com/online-payments/checkouts/hosted-checkout/index.md`
> LLM entrypoint for discovery: `https://developer.sumup.com/llms.txt`

## When to use

- You want the fastest launch path with no frontend payment UI build.
- You want to keep PCI scope low by using a SumUp-hosted payment page.
- Redirecting the customer to a hosted checkout page is acceptable.

## Server flow (single create call)

1. Create checkout: `POST /v0.1/checkouts` with `hosted_checkout: { enabled: true }`.
2. Optionally set `redirect_url` for post-payment return navigation.
3. Save both `id` and `hosted_checkout_url` from the response.
4. Redirect customer to `hosted_checkout_url`.
5. Verify final status on backend (`GET /v0.1/checkouts/{id}` or webhook), not from redirect alone.

### cURL example

```bash
curl -X POST https://api.sumup.com/v0.1/checkouts \
  -H "Authorization: Bearer $SUMUP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_code": "MCXXXXXX",
    "amount": 15.0,
    "currency": "EUR",
    "checkout_reference": "order-1001",
    "redirect_url": "https://example.com/payments/return",
    "hosted_checkout": {
      "enabled": true
    }
  }'
```

### `@sumup/sdk` (TypeScript)

```ts
import { SumUp } from "@sumup/sdk";

const sumup = new SumUp({
  apiKey: process.env.SUMUP_API_KEY!,
});

const checkout = await sumup.checkouts.create({
  merchant_code: "MCXXXXXX",
  amount: 15.0,
  currency: "EUR",
  checkout_reference: "order-1001",
  redirect_url: "https://example.com/payments/return",
  hosted_checkout: { enabled: true },
});

// Persist checkout.id and redirect customer to checkout.hosted_checkout_url
```

### `sumup-go` (Go)

```go
checkout, err := client.Checkout.Create(ctx, sumup.CreateCheckoutBody{
    MerchantCode:      "MCXXXXXX",
    Amount:            15.0,
    Currency:          "EUR",
    CheckoutReference: "order-1001",
    RedirectURL:       "https://example.com/payments/return",
    HostedCheckout: &sumup.HostedCheckout{
        Enabled: true,
    },
})
if err != nil {
    return err
}

// Persist checkout.ID and redirect to checkout.HostedCheckoutURL
```

### `sumup` (Python)

```python
checkout = sumup_client.checkouts.create(
    merchant_code="MCXXXXXX",
    amount=15.0,
    currency="EUR",
    checkout_reference="order-1001",
    redirect_url="https://example.com/payments/return",
    hosted_checkout={"enabled": True},
)

# Persist checkout["id"] and redirect to checkout["hosted_checkout_url"]
```

### PHP

```php
$checkout = $sumup->checkouts()->create([
    "merchant_code" => "MCXXXXXX",
    "amount" => 15.0,
    "currency" => "EUR",
    "checkout_reference" => "order-1001",
    "redirect_url" => "https://example.com/payments/return",
    "hosted_checkout" => [
        "enabled" => true,
    ],
]);

// Persist $checkout["id"] and redirect to $checkout["hosted_checkout_url"]
```

## Session lifetime

- Hosted checkout sessions expire after 30 minutes.
- If expired, create a new checkout and redirect to the new `hosted_checkout_url`.

## Verification model

- `redirect_url` is a customer navigation signal, not payment proof.
- Finalize orders only after backend verification (`GET /v0.1/checkouts/{id}` or webhook confirmation).

## Common pitfalls

- Reusing `checkout_reference` values (must be unique per attempt).
- Omitting `merchant_code` in multi-merchant/multi-context backends.
- Treating the post-payment redirect as final payment confirmation.

## Reading Order

1. This file.
2. `references/checkouts-api/README.md` for create/retrieve checkout details.
3. `references/webhooks-3ds/README.md` for async confirmation and reconciliation.
4. `references/online-testing/README.md` for sandbox cards and failure cases.

## See Also

- `references/checkouts-api/README.md`
- `references/webhooks-3ds/README.md`
- `references/online-testing/README.md`
- `references/checkout-widget/README.md`
