# Go SDK

> Prefer the latest SumUp docs first: `https://developer.sumup.com/online-payments/sdks/go/index.md`
> LLM entrypoint for discovery: `https://developer.sumup.com/llms.txt`

Use `github.com/sumup/sumup-go`.

## Card-present: Cloud API checkout

```go
checkout, err := client.Readers.CreateCheckout(ctx, merchantCode, readerID, sumup.CreateCheckoutRequest{
	TotalAmount: sumup.CreateCheckoutRequestTotalAmount{Currency: "EUR", MinorUnit: 2, Value: 1500},
})
```

## Card-present: terminate checkout

```go
err := client.Readers.TerminateCheckout(ctx, merchantCode, readerID)
```

## Online: create checkout

```go
checkout, err := client.Checkouts.Create(ctx, sumup.CheckoutsCreateParams{
	MerchantCode: merchantCode,
	Amount: 15.0,
	Currency: sumup.CurrencyEUR,
	CheckoutReference: "order-1001",
})
```

## Reading Order

1. This file.
2. `references/checkouts-api/README.md` for online checkout API flow.
3. `references/checkout-widget/README.md` for client UI handoff.
4. `references/webhooks-3ds/README.md` for async confirmation.

## See Also

- `references/checkouts-api/README.md`
- `references/checkout-widget/README.md`
- `references/webhooks-3ds/README.md`
- `references/cloud-api/README.md`
- `references/checkout-playbook.md`
