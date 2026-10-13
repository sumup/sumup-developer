# Testing Online Checkout with Test Cards

> Prefer the latest SumUp docs first: `https://developer.sumup.com/online-payments/testing/index.md`
> LLM entrypoint for discovery: `https://developer.sumup.com/llms.txt`

Use a sandbox merchant account for all online checkout QA. Sandbox transactions are simulated only and do not move real funds.

## Setup

1. Switch to a sandbox merchant account in the SumUp Dashboard.
2. Create checkouts exactly as you would in production.
3. Use test card numbers from the sandbox test set instead of real cards.

## Common Test Card Details

Use these values with all test cards unless the canonical docs say otherwise:

- CVV: any 3 digits, for example `123`
- Expiry date: any future date, for example `12/30`
- Cardholder name: any name

## Core Scenarios

### Successful payment without challenge

Use these for the main happy path:

- VISA `4200 0000 0000 0091`
- Mastercard `5200 0000 0000 0007`

Expected result: payment succeeds and no cardholder challenge is required.

### Authentication attempted without challenge

Use these to confirm your flow handles frictionless authentication:

- VISA `4200 0000 0000 0109`
- Mastercard `5200 0000 0000 0023`

Expected result: authentication is attempted, then payment completes without a challenge screen.

### 3DS challenge required

Use these to validate redirect/challenge handling:

- VISA `4200 0000 0000 0042`
- Mastercard `5200 0000 0000 0015`

Expected result: the checkout requires a 3D Secure challenge before completion.

### 3DS failure cases

Use these to test error handling around failed or unavailable authentication:

- Technical authentication failure: VISA `4012 0010 3746 1114`
- Cardholder not enrolled: VISA `4012 0010 3714 1112`
- Card or issuer not participating: VISA `4532 4970 8877 1651`

Expected result: your UI shows a recoverable error, your backend does not mark the order as paid, and logs capture the failure reason.

### Payment failure by amount

To simulate an unsuccessful payment, create a checkout for amount `42.01`, `42.76`, or `42.91` depending on the currency representation used by that checkout flow.

Expected result: payment fails even if the card details are otherwise valid.

## What to Verify

- The frontend handles success, failure, and `auth-screen`/redirect steps correctly.
- The backend verifies final checkout status before order fulfillment.
- Failed or abandoned attempts never create successful order states.
- Logs store the checkout ID, reference, and failure reason for troubleshooting.

## Reading Order

1. This file.
2. `references/checkout-widget/README.md` for widget-based payment testing.
3. `references/checkouts-api/README.md` for server-side checkout lifecycle.
4. `references/webhooks-3ds/README.md` for async confirmation and 3DS verification.

## See Also

- `references/checkout-widget/README.md`
- `references/checkouts-api/README.md`
- `references/webhooks-3ds/README.md`
- `references/apm/README.md`
