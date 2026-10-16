# Swift Checkout SDK (Online)

> Prefer the latest SumUp docs first: `https://developer.sumup.com/online-payments/checkouts/swift-checkout/index.md`
> LLM entrypoint for discovery: `https://developer.sumup.com/llms.txt`

Use this integration path for fast online checkout experiences with Apple Pay/Google Pay support.

## Flow

1. Create checkout server-side via SumUp API.
2. Initialize Swift Checkout with returned checkout identifier.
3. Present checkout UI and handle completion callback.
4. Verify final checkout status server-side.

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
