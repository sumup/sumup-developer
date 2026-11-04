---
name: sumup
description: Implement or modify SumUp payment integrations using Hosted Checkout, Card Widget, Checkouts API, saved cards, React Native Checkout, terminal SDKs, Tap to Pay, or Cloud API. Use for integration code and payment-flow reviews.
license: Apache-2.0
---

# Build SumUp Payment Integrations

Work from the requested flow and existing implementation. Preserve the chosen integration and installed SDK versions unless the task calls for changing them. Inspect available code and configuration before asking for missing merchant, platform, or credential details; ask only when the missing information blocks the work.

Check current contracts through the [documentation index](https://developer.sumup.com/llms.txt), [API reference index](https://developer.sumup.com/api/llms.txt), or [OpenAPI specification](https://developer.sumup.com/openapi.json). Use the installed SDK's types to verify method names and request models. If current sources cannot be reached, distinguish bundled guidance from verified behavior.

## Choose the relevant references

Open the references needed for the task; a flow may need both a channel guide and backend or callback details. Paths below are relative to this skill directory.

| Task | Reference |
| --- | --- |
| Redirect to a hosted payment page | [Hosted Checkout](references/hosted-checkout/README.md) |
| Embed payment collection in a website | [Card Widget](references/checkout-widget/README.md) |
| Add Apple Pay or Google Pay buttons on a website | [Swift Checkout JavaScript SDK](references/swift-checkout-sdk/README.md) |
| Show a mobile payment sheet | [React Native Checkout](references/react-native-sdk/README.md) |
| Save a card or charge a saved token | [Tokenization](references/recurring-tokenization/README.md) |
| Create, process, or retrieve online checkouts | [Checkouts API](references/checkouts-api/README.md) |
| Connect a native app to a reader | [iOS](references/ios-terminal-sdk/README.md) or [Android](references/android-reader-sdk/README.md) |
| Accept contactless payments on a phone | [Android Tap to Pay](references/android-tap-to-pay-sdk/README.md) or [iPhone guide](https://developer.sumup.com/terminal-payments/sdks/ios/tap-to-pay/) |
| Control a Solo reader from a POS/backend | [Cloud API](references/cloud-api/README.md) |
| Handle callbacks or 3DS | [Webhooks and 3DS](references/webhooks-3ds/README.md) |
| Recover an uncertain payment or refund | [Safe retries](references/response-handling/README.md) |
| Check credentials, scopes, or affiliate setup | [Authorization](references/security/README.md) |
| Find language examples, APMs, tests, or legacy Payment Switch | [Reference index](references/README.md) |

## Payment rules

- Create online checkouts on the backend. Keep secret `sup_sk_` keys and OAuth client secrets there; supported frontend checkout SDKs use public `sup_pk_` merchant keys.
- Prefer supported hosted, widget, or SDK payment collection over introducing raw-card handling. Swift Checkout is a browser JavaScript SDK, not a native iOS SDK.
- Use API keys for the merchant that owns them and OAuth for delegated merchant access. Verify the selected endpoint's permissions and the credential's merchant context.
- For terminal flows, supply the required Affiliate Key and matching app identifier. Android Tap-to-Pay requires its separate SDK and affiliate metadata.
- Persist payment-attempt references and returned IDs before processing results. Give a confirmed new attempt its own reference; `checkout_reference` does not replace duplicate-payment checks.
- For online orders, retrieve the expected checkout and require `status: "PAID"`, matching merchant, reference, amount, and currency before fulfillment. A redirect or client callback is not payment proof.
- Cloud API checkout acceptance is asynchronous. Correlate its `client_transaction_id` and reconcile the final transaction result.
- Treat callbacks as notifications and make order updates idempotent. Online checkout callbacks do not document HMAC signing; apply signature checks only when the selected product specifies them.
- After a timeout, lost response, or `5xx`, reconcile the existing payment or refund before repeating it. If checkout creation returned no ID, look up the original `checkout_reference`.
- Use current non-deprecated endpoints for new work; keep unrelated migrations outside the requested change.

## Verify the affected flow

Use the project's existing checks and relevant sandbox scenarios. For payment-flow changes, cover success, decline (`11.00` where documented), and any affected callback, authentication, cancellation, or uncertain-result path. Reader-based tests and online test cards use different setups. State which checks ran and what still requires a device, credentials, or live-provider verification.

If installed, `sumup-best-practices`, `sumup-debug`, `sumup-testing`, `sumup-mcp`, and `upgrade-sumup` cover selection, diagnosis, testing, MCP, and migrations. Use them when those tasks are requested; they are not prerequisites for this skill. Answer narrow questions directly without a full integration plan.
