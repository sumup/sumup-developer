# .NET SDK

> Prefer the latest SumUp docs first: `https://developer.sumup.com/online-payments/sdks/dotnet/index.md`
> LLM entrypoint for discovery: `https://developer.sumup.com/llms.txt`

Use NuGet package `SumUp`.

## Online: create checkout

```csharp
var checkout = await client.Checkouts.CreateAsync(new CheckoutCreateRequest
{
    MerchantCode = merchantCode,
    Amount = 15.0f,
    Currency = Currency.Eur,
    CheckoutReference = "order-1001",
});
```

## Card-present: Cloud API checkout

```csharp
var readerCheckout = await client.Readers.CreateCheckoutAsync(
    merchantCode,
    readerId,
    new CreateReaderCheckoutRequest
    {
        TotalAmount = new CreateReaderCheckoutRequestTotalAmount
        {
            Currency = "EUR",
            MinorUnit = 2,
            Value = 1500,
        },
    });
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
