# Android Tap-to-Pay SDK (Card-present on phone)

> Prefer the latest SumUp docs first: `https://developer.sumup.com/terminal-payments/sdks/android/tap-to-pay/index.md`
> LLM entrypoint for discovery: `https://developer.sumup.com/llms.txt`

## SDK 1.1.7 migration

The [1.1.7 release notes](https://developer.sumup.com/changelog/) recommend upgrading for security fixes and identify breaking API changes:

- `CheckoutData.affiliateData` is required; pass `AffiliateModel` with your integration's Affiliate Key.
- Remove references to `PaymentFlowClosedSuccessfully.shouldDisplayReceipt`.
- Verify the release build with R8/ProGuard; the SDK no longer disables shrinking or installs global keep rules for all enums and native methods.
- Handle backend error details through `TransactionFailed.tapToPayException`. JCB support is included; do not describe upcoming Girocard support as already available.

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
    affiliateData = AffiliateModel(key = "YOUR_AFFILIATE_KEY"),
  ),
  skipSuccessScreen = false
).collectLatest { event ->
  // Handle the SDK payment event and retain its transaction identifiers.
}
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
