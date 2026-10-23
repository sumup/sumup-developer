# Android Tap-to-Pay SDK (Card-present on phone)

> Prefer the latest SumUp docs first: `https://developer.sumup.com/terminal-payments/sdks/android-ttp/index.md`
> LLM entrypoint for discovery: `https://developer.sumup.com/llms.txt`

## Initialize once

```kotlin
val tapToPay = TapToPayApiProvider.provide(applicationContext)
val initResult = tapToPay.init(authTokenProvider)
```

## Start payment

```kotlin
tapToPay.startPayment(
  checkoutData = CheckoutData(
    totalAmount = 1234,
    tipsAmount = null,
    vatAmount = null,
    clientUniqueTransactionId = UUID.randomUUID().toString(),
    customItems = null,
    priceItems = null,
    products = null,
    processCardAs = null,
    affiliateData = null,
  ),
  skipSuccessScreen = false
)
```

## Tear down

```kotlin
tapToPay.tearDown()
```

## Reading Order

1. This file.
2. `references/android-reader-sdk/README.md` for reader-based Android terminal flows.
3. `references/cloud-api/README.md` for backend-controlled Solo workflows.

## See Also

- `references/android-reader-sdk/README.md`
- `references/ios-terminal-sdk/README.md`
- `references/cloud-api/README.md`
- `references/checkout-playbook.md`
