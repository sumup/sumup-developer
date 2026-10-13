# React Native SDK (Online)

> Prefer the latest SumUp docs first: `https://developer.sumup.com/online-payments/sdks/react-native/index.md`
> LLM entrypoint for discovery: `https://developer.sumup.com/llms.txt`

Use Payment Sheet for online checkout UX in mobile apps.

## Provider setup

```tsx
<SumUpProvider apiKey="sup_sk_...">
  <PaymentScreen />
</SumUpProvider>
```

## Initialize + present

```tsx
const { initPaymentSheet, presentPaymentSheet } = useSumUp();

await initPaymentSheet({ checkoutId: "<CHECKOUT_ID>" });
await presentPaymentSheet();
```

Create checkout on backend first, then pass `checkoutId` to the app.

## Reading Order

1. This file.
2. `references/checkouts-api/README.md` for backend checkout creation.
3. `references/webhooks-3ds/README.md` for async confirmation and idempotency.

## See Also

- `references/checkout-widget/README.md`
- `references/checkouts-api/README.md`
- `references/webhooks-3ds/README.md`
- `references/apm/README.md`
