---
title: ".NET SDK"
tags: ["SDK", ".NET"]
publishedDate: 2026-01-04
---

We are happy to announce the release of our [.NET](https://dotnet.microsoft.com/) SDK. The SDK is maintained under [sumup/sumup-dotnet](https://github.com/sumup/sumup-dotnet) and covers all of SumUp's public APIs.

```csharp
using SumUp;

using var client = new SumUpClient();

var merchantResponse = await client.Merchant.GetAsync();
var merchantCode = merchantResponse.Data?.MerchantProfile?.MerchantCode
    ?? throw new InvalidOperationException("Merchant code not returned.");

var checkoutResponse = await client.Checkouts.CreateAsync(new CheckoutCreateRequest
{
    Amount = 10.00f,
    Currency = Currency.Eur,
    CheckoutReference = $"checkout-{Guid.NewGuid():N}",
    MerchantCode = merchantCode,
    Description = "Test payment",
    RedirectUrl = "https://example.com/success",
    ReturnUrl = "https://example.com/webhook",
});

Console.WriteLine($"Checkout ID: {checkoutResponse.Data?.Id}");
```

See the repository for more [examples](https://github.com/sumup/sumup-dotnet/tree/main/examples) and don't hesitate to [let us know](/contact) if you have any questions.
