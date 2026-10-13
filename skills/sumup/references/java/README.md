# Java SDK

> Prefer the latest SumUp docs first: `https://developer.sumup.com/online-payments/sdks/java/index.md`
> LLM entrypoint for discovery: `https://developer.sumup.com/llms.txt`

Use `com.sumup:sumup-sdk`.

## Online: create checkout

```java
var checkout = client.checkouts().createCheckout(
    CheckoutCreateRequest.builder()
        .merchantCode(System.getenv("SUMUP_MERCHANT_CODE"))
        .amount(15.0f)
        .currency(Currency.EUR)
        .checkoutReference("order-1001")
        .build()
);
```

## Card-present: Cloud API checkout

```java
var checkout = client.readers().createReaderCheckout(
    merchantCode,
    readerId,
    CreateReaderCheckoutRequest.builder()
        .totalAmount(Money.builder().currency("EUR").minorUnit(2L).value(1500L).build())
        .build()
);
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
