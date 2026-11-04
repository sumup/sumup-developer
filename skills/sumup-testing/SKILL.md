---
name: sumup-testing
description: Set up SumUp sandbox merchants, choose online test cards or terminal simulation amounts, test saved-card tokenization, and design or run payment-flow regression checks. Use for requested test setup, scenarios, or verification.
license: Apache-2.0
---

# Test SumUp Payment Flows

Match the test to the requested integration and changed behavior. Inspect an existing harness and credentials configuration before proposing new infrastructure. For a test-data question, provide the relevant card or amount directly; a full end-to-end matrix is useful only when the task calls for it.

## Choose the scenario reference

Read [sandbox scenarios](references/scenarios.md) for the selected flow:

- **Online payments:** test cards, frictionless/challenge authentication, and documented decline amounts.
- **Reader SDK or Cloud API:** physical cards or Virtual Solo, sandbox SDK login, minor-unit amounts, and specific decline simulations.
- **Saved cards:** sandbox tokenization through the Payment Widget, subsequent charges, and deactivation.

Check the linked current guide when its data or SDK requirements differ from the bundled reference. Online test cards do not replace a physical card in a reader test, and simulated decline amounts do not reproduce a disconnected device.

## Establish the test merchant

Use sandbox merchants and credentials for simulated payments. Confirm the merchant selected by the actual app/API credential; switching merchants in the Dashboard alone does not switch SDK login. Keep secrets and raw card data out of logs. Store checkout/transaction IDs and attempt references for reconciliation.

Create online checkouts server-side with `merchant_code`. The standard decline amount is `11.00` in the documented flow's units; Cloud API represents `11.00 EUR` as `{ "currency": "EUR", "minor_unit": 2, "value": 1100 }`. Creating a checkout alone does not complete a payment.

## Verify the affected outcomes

- A successful online payment is confirmed by retrieving `status: "PAID"`; Cloud API acceptance must be followed by its final transaction result.
- A declined, cancelled, or failed-authentication payment leaves the order unpaid. For test plans, include the relevant success and decline paths plus any changed challenge, expiry, callback, or device behavior.
- Repeated callbacks or status reads do not repeat fulfillment. Keep payment attempts linked to their order without assuming `checkout_reference` is a server idempotency key.
- After a timeout or `5xx`, reconcile the original payment or refund before another attempt. If creation returned no ID, look up the original checkout reference.
- For tokenization, verify that the stored token belongs to the expected customer, then test a later charge and deactivation. Sandbox widget tokenization with 3DS requires no additional activation or support request.

Use the project's existing tests for local assertions and sandbox/device checks for provider behavior. Report what ran, what passed or failed, and which checks require a device, credentials, or provider access; a passing unit test does not establish a successful payment.
