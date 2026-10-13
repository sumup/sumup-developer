# Alternative Payment Methods (Online)

> Prefer the latest SumUp docs first: `https://developer.sumup.com/online-payments/apm/index.md`
> LLM entrypoint for discovery: `https://developer.sumup.com/llms.txt`

APMs are surfaced primarily through checkout UIs (especially Card Widget).

## Available methods (market dependent)

Apple Pay, Google Pay, Bancontact, Blik, Boleto, EPS, iDeal, MyBank, PIX, Przelewy24, Satispay.

## Integration notes

- Enable APMs with SumUp onboarding/contact flow.
- Card Widget supports APM rendering and can filter methods via `onPaymentMethodsLoad`.
- Country/merchant setup determines method availability.

## Reading Order

1. This file.
2. `references/checkout-widget/README.md` for UI-based APM exposure.
3. `references/checkouts-api/README.md` for server-side checkout orchestration.

## See Also

- `references/checkout-widget/README.md`
- `references/checkouts-api/README.md`
- `references/webhooks-3ds/README.md`
