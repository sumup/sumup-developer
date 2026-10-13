# iOS Terminal SDK (Card-present)

> Prefer the latest SumUp docs first: `https://developer.sumup.com/terminal-payments/sdks/ios-sdk/index.md`
> LLM entrypoint for discovery: `https://developer.sumup.com/llms.txt`

## Setup

```swift
SumUpSDK.setup(withAPIKey: "sup_afk_xxx")
```

## Login + prepare

```swift
SumUpSDK.presentLogin(from: self, animated: true) { success, error in }
SumUpSDK.prepareForCheckout()
```

## Start checkout

```swift
let request = CheckoutRequest(
  total: NSDecimalNumber(string: "12.34"),
  title: "Coffee",
  currencyCode: merchantCurrencyCode
)
request.foreignTransactionID = UUID().uuidString
SumUpSDK.checkout(with: request, from: self) { result, error in }
```

## Reading Order

1. This file.
2. `references/cloud-api/README.md` for backend-controlled terminal flow alternatives.
3. `references/payment-switch/README.md` only for explicit legacy app-handoff cases.

## See Also

- `references/android-reader-sdk/README.md`
- `references/android-tap-to-pay-sdk/README.md`
- `references/cloud-api/README.md`
- `references/payment-switch/README.md`
- `references/checkout-playbook.md`
