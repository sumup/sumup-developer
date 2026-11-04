# React Native SDK (Online)

> Prefer the latest SumUp docs first: `https://developer.sumup.com/online-payments/sdks/react-native/index.md`
> LLM entrypoint for discovery: `https://developer.sumup.com/llms.txt`

Use Payment Sheet for online checkout UX in mobile apps.

The current guide targets `@sumup/react-native-checkout@0.0.0-alpha.4`; check its API before upgrading. Create the checkout on your backend with a secret key or OAuth token. The app receives only the checkout ID and the merchant's public key.

## Provider setup

```tsx
<SumUpProvider apiKey="sup_pk_YOUR_PUBLIC_MERCHANT_KEY">
  <PaymentScreen />
</SumUpProvider>
```

## Initialize + present

```tsx
const { initPaymentSheet, presentPaymentSheet } = useSumUp();

async function pay(checkoutId: string) {
  try {
    const initialized = await initPaymentSheet({ checkoutId, language: "en" });
    if (initialized.error) return;

    const result = await presentPaymentSheet();
    if (result.error) return;
    // Ask your backend to retrieve the checkout and confirm the order status.
  } catch {
    // The result is uncertain: reconcile the existing checkout before retrying.
  }
}
```

Handle returned SDK errors, cancellation, and rejected promises in the UI. A successful sheet response is not payment proof; the backend must require checkout status `PAID`. Never bundle a `sup_sk_` secret key or OAuth client secret in the app.

For saved cards, use `initSaveCardSheet` / `presentSaveCardSheet` and the server-side tokenization flow in `references/recurring-tokenization/README.md`.

## Reading Order

1. This file.
2. `references/checkouts-api/README.md` for backend checkout creation.
3. `references/webhooks-3ds/README.md` for async confirmation and idempotency.

## See Also

- `references/checkout-widget/README.md`
- `references/checkouts-api/README.md`
- `references/webhooks-3ds/README.md`
- `references/apm/README.md`
