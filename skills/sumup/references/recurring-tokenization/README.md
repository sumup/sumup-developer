# Recurring Payments and Tokenization (Online)

> Prefer the latest SumUp docs first: `https://developer.sumup.com/online-payments/guides/tokenization-with-payment-sdk/index.md`
> LLM entrypoint for discovery: `https://developer.sumup.com/llms.txt`

## Prerequisites

Use a merchant account and server-side credentials. Sandbox merchants can test `SETUP_RECURRING_PAYMENT` through the Payment Widget with test cards and 3DS without additional activation or contacting support. OAuth applications must obtain the scopes required for their endpoints; see `references/security/README.md`.

## Flow

1. Create a customer with `POST /v0.1/customers`, your business `customer_id`, and the customer's details.
2. Create a checkout with `POST /v0.1/checkouts`, the same `customer_id`, and `purpose: "SETUP_RECURRING_PAYMENT"`.
3. Complete the setup through the Payment Widget, which handles consent, mandate collection, and 3DS. The authorization amount is reimbursed after verification.
4. Retrieve the checkout or the customer's payment instruments and store `payment_instrument.token` securely with its `customer_id` on the backend.
5. For later charges, create a normal checkout, then process it with the saved token and matching customer.

## Create the setup checkout

Send this JSON body from your backend:

```json
{
  "merchant_code": "MCXXXXXX",
  "amount": 1.0,
  "currency": "EUR",
  "checkout_reference": "setup-recurring-1001",
  "customer_id": "cust_1001",
  "purpose": "SETUP_RECURRING_PAYMENT"
}
```

Use your installed server SDK's current request model. The [SDK documentation index](https://developer.sumup.com/tools/sdks/index.md) links to each language's examples; service names and typed request bodies differ between SDKs.

## Process a subsequent checkout

Create a new checkout for the payment attempt, then send this body to `PUT /v0.1/checkouts/{id}`:

```json
{
  "payment_type": "card",
  "token": "pit_example",
  "customer_id": "cust_1001"
}
```

A saved token must be used with its matching customer. Creating the setup checkout does not schedule future charges; the integration must initiate each subsequent payment and handle authentication or other next steps returned by the API.

Use the Payment Widget to collect card data. A direct-card tokenization integration must separately meet the documented mandate and PCI requirements.

## Deactivate a saved card

Use `DELETE /v0.1/customers/{customer_id}/payment-instruments/{token}`.

## Verification and retries

- Retrieve the final payment result on the backend before fulfillment.
- Test token creation, instrument retrieval, a subsequent charge, failed authentication, and deactivation with a sandbox merchant.
- After a timeout or uncertain result, reconcile the existing payment before making another charge. See `references/response-handling/README.md`.

## See Also

- `references/checkout-widget/README.md`
- `references/checkouts-api/README.md`
- `references/webhooks-3ds/README.md`
- `references/online-testing/README.md`
