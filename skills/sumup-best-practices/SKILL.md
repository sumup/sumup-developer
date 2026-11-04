---
name: sumup-best-practices
description: Choose a SumUp integration and credential model, or review its payment security. Use for Hosted Checkout vs Card Widget, reader SDK vs Cloud API, API key vs OAuth, and public vs secret key decisions.
license: Apache-2.0
---

# Choose a SumUp Integration

Start with the user's constraints and existing stack. Recommend the simplest supported path that meets them; preserve an explicit integration choice unless evidence shows it cannot satisfy the requirement. Use the [current documentation index](https://developer.sumup.com/llms.txt) to verify availability and product-specific requirements.

## Choose by requirement

| Requirement | Default choice and deciding constraint |
| --- | --- |
| Online checkout with redirect UX | Hosted Checkout; the backend creates the checkout and redirects to its hosted URL. |
| Embedded website payment collection | Card Widget; SumUp provides the payment interface and authentication flow. |
| Website wallet buttons | Swift Checkout JavaScript SDK; verify browser/wallet and merchant-domain requirements. |
| React Native payment sheet | React Native Checkout; check the current alpha API and use a public merchant key in the app. |
| Save cards and charge later | Customers plus tokenization; the stored token belongs to its customer and each later charge is a separate attempt. |
| Native mobile app controls a reader | iOS Terminal or Android Reader SDK; check supported devices and platform permissions. |
| Contactless payment on the phone | Tap to Pay on iPhone or the separate Android Tap-to-Pay SDK; verify device eligibility and access requirements. |
| POS or backend controls Solo | Cloud API; design around asynchronous transaction results. |
| Existing app must hand off to the SumUp app | Payment Switch; retain it when that handoff is a requirement. |

A custom backend may still use hosted, widget, or SDK payment collection. Do not introduce direct card-data handling just because the application needs custom order logic.

## Choose credentials and verify payment state

- Use a secret API key on the server for its owning merchant. Use OAuth when other merchants authorize the application. Check endpoint permissions and any required OAuth scope verification in the [authorization guide](https://developer.sumup.com/tools/authorization/).
- Public `sup_pk_` merchant keys belong in supported checkout clients; secret `sup_sk_` keys and OAuth client secrets do not. Sandbox behavior follows the authenticated merchant, not an assumed key-prefix tier.
- Terminal integrations need the Affiliate Key and matching app identifiers required by that SDK or API.
- Match the checkout/transaction to the expected merchant, order reference, amount, and currency. Retrieve final payment state before fulfillment; callback delivery and HTTP success are not enough.
- Resolve an uncertain payment or refund before repeating it. A unique reference helps reconciliation but is not a guarantee of server-enforced idempotency.
- Make repeated notifications and status reads safe for order updates. Follow the selected callback protocol rather than assuming every SumUp webhook is signed.

For a selection question, explain the deciding constraint and credential requirements. For a security review, lead with concrete findings and evidence, and describe validation for the affected behavior. Add alternatives or a launch checklist only when they help the requested decision.

For implementation, use the `sumup` skill if installed, or continue with the selected flow's current documentation. General account reporting and MCP setup do not require an integration-selection exercise.
