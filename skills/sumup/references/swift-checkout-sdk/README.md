# Swift Checkout SDK (Web)

> Prefer the latest SumUp docs first: `https://developer.sumup.com/online-payments/checkouts/swift-checkout/index.md`
> LLM entrypoint for discovery: `https://developer.sumup.com/llms.txt`

Swift Checkout is a browser JavaScript SDK for Apple Pay and Google Pay on websites. Its name does not mean it is a native iOS SDK written in Swift. For a React Native app, use `references/react-native-sdk/README.md`; for native iOS in-person payments, use `references/ios-terminal-sdk/README.md`.

## Flow

1. Serve the website over HTTPS and load `https://js.sumup.com/swift-checkout/v1/sdk.js`.
2. Initialize `window.SumUp.SwiftCheckout` with the merchant's public `sup_pk_` key. Keep secret API keys on your backend.
3. Create checkout resources on the backend and follow the guide's payment element, wallet authorization, and checkout-processing flow.
4. Handle completion and verify final checkout status on the backend before fulfillment.

Complete the wallet-specific merchant/domain setup in the current guide. Wallet and browser availability determine which buttons can be shown.

Also see `references/checkout-widget/README.md` and `references/webhooks-3ds/README.md`.

## Reading Order

1. This file.
2. `references/checkouts-api/README.md` for backend checkout orchestration.
3. `references/webhooks-3ds/README.md` for async confirmation and retries.

## See Also

- `references/checkout-widget/README.md`
- `references/checkouts-api/README.md`
- `references/webhooks-3ds/README.md`
- `references/apm/README.md`
