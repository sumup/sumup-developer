# Recurring Payments and Tokenization (Online)

> Prefer the latest SumUp docs first: `https://developer.sumup.com/online-payments/guides/tokenization-with-payment-sdk/index.md`
> LLM entrypoint for discovery: `https://developer.sumup.com/llms.txt`

## Concept

Recurring charges use a stored `payment_instrument.token` tied to a `customer_id`.
Treat the token + customer pair as required for subsequent charges.

## Recommended 5-step flow

1. Create customer: `POST /v0.1/customers` with your business `customer_id` and `personal_details`.
2. Create tokenization checkout: `POST /v0.1/checkouts` with `customer_id` and `purpose: "SETUP_RECURRING_PAYMENT"`.
3. Complete checkout via Card Widget (recommended): handles consent, mandate collection, and 3DS.
4. Retrieve token:
   - from completed checkout response (`payment_instrument.token`), or
   - with `GET /v0.1/customers/{customer_id}/payment-instruments`.
5. Charge later:
   - create a normal checkout (no setup purpose), then
   - process with `PUT /v0.1/checkouts/{id}` and `{ payment_type: "card", token, customer_id }`.

Authorization amount in setup checkout is reimbursed immediately after successful verification.

## Step 2 example: create tokenization checkout

### TypeScript (`@sumup/sdk`)

```ts
const checkout = await sumup.checkouts.create({
  merchant_code: "MCXXXXXX",
  amount: 1.0,
  currency: "EUR",
  checkout_reference: "setup-recurring-1001",
  customer_id: "cust_1001",
  purpose: "SETUP_RECURRING_PAYMENT",
});
```

### Python (`sumup`)

```python
checkout = sumup_client.checkouts.create(
    merchant_code="MCXXXXXX",
    amount=1.0,
    currency="EUR",
    checkout_reference="setup-recurring-1001",
    customer_id="cust_1001",
    purpose="SETUP_RECURRING_PAYMENT",
)
```

### Go (`sumup-go`)

```go
checkout, err := client.Checkout.Create(ctx, sumup.CreateCheckoutBody{
    MerchantCode:      "MCXXXXXX",
    Amount:            1.0,
    Currency:          "EUR",
    CheckoutReference: "setup-recurring-1001",
    CustomerID:        "cust_1001",
    Purpose:           "SETUP_RECURRING_PAYMENT",
})
if err != nil {
    return err
}
```

### PHP

```php
$checkout = $sumup->checkouts()->create([
    "merchant_code" => "MCXXXXXX",
    "amount" => 1.0,
    "currency" => "EUR",
    "checkout_reference" => "setup-recurring-1001",
    "customer_id" => "cust_1001",
    "purpose" => "SETUP_RECURRING_PAYMENT",
]);
```

## Step 5 example: process checkout with saved token

### TypeScript (`@sumup/sdk`)

```ts
await sumup.checkouts.process(checkoutId, {
  payment_type: "card",
  token: "pit_abc123",
  customer_id: "cust_1001",
});
```

### Python (`sumup`)

```python
sumup_client.checkouts.process(
    checkout_id=checkout_id,
    payment_type="card",
    token="pit_abc123",
    customer_id="cust_1001",
)
```

### Go (`sumup-go`)

```go
_, err = client.Checkout.Process(ctx, checkoutID, sumup.ProcessCheckoutBody{
    PaymentType: "card",
    Token:       "pit_abc123",
    CustomerID:  "cust_1001",
})
if err != nil {
    return err
}
```

### PHP

```php
$result = $sumup->checkouts()->process($checkoutId, [
    "payment_type" => "card",
    "token" => "pit_abc123",
    "customer_id" => "cust_1001",
]);
```

## Direct API tokenization (without widget)

Direct tokenization without widget requires mandate details on processing call:

```json
{
  "payment_type": "card",
  "card": {
    "number": "****",
    "expiry_month": "01",
    "expiry_year": "30",
    "cvv": "***"
  },
  "mandate": {
    "type": "recurrent",
    "user_agent": "Mozilla/5.0 ...",
    "user_ip": "203.0.113.10"
  }
}
```

Use this path only if you are prepared for additional PCI and legal/compliance obligations.

## Deactivate saved cards

Use:

`DELETE /v0.1/customers/{customer_id}/payment-instruments/{token}`

## Common pitfalls

- Missing `purpose: "SETUP_RECURRING_PAYMENT"` in tokenization checkout.
- Missing `customer_id` on setup checkout.
- Attempting recurring charges with `token` but without matching `customer_id`.
- Skipping widget flow and forgetting required `mandate` details.

## Reading Order

1. This file.
2. `references/checkout-widget/README.md` for recommended tokenization UI flow.
3. `references/checkouts-api/README.md` for checkout create/process/retrieve behavior.
4. `references/webhooks-3ds/README.md` for async confirmation and retries.
5. `references/online-testing/README.md` for sandbox test cards and failure cases.

## See Also

- `references/checkout-widget/README.md`
- `references/checkouts-api/README.md`
- `references/webhooks-3ds/README.md`
- `references/online-testing/README.md`
