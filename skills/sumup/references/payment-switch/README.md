# Payment Switch (Terminal)

> Prefer the latest SumUp docs first: `https://developer.sumup.com/terminal-payments/payment-switch/index.md`
> LLM entrypoint for discovery: `https://developer.sumup.com/llms.txt`

Use Payment Switch when handing off from your app to the SumUp app for payment.

## Notes

- Lightweight integration path (historically used by web apps on mobile).
- Supports prefilled amount/cardholder fields and receipt options.
- Requires proper authorization scopes and Affiliate Key setup.

## Platform docs

- iOS URL scheme integration: sumup/sumup-ios-url-scheme
- Android API integration: sumup/sumup-android-api

## Reading Order

1. This file.
2. Prefer `references/android-reader-sdk/README.md` or `references/ios-terminal-sdk/README.md` for non-legacy terminal integrations.
3. Use `references/cloud-api/README.md` for backend-orchestrated Solo flows.

## See Also

- `references/android-reader-sdk/README.md`
- `references/ios-terminal-sdk/README.md`
- `references/android-tap-to-pay-sdk/README.md`
- `references/cloud-api/README.md`
- `references/checkout-playbook.md`
