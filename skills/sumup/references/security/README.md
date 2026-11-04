# Security and Authorization

> Prefer the latest SumUp docs first: `https://developer.sumup.com/tools/authorization/index.md`
> LLM entrypoint for discovery: `https://developer.sumup.com/llms.txt`

## API keys

- Secret API keys beginning with `sup_sk_` authorize server-side requests for the merchant that created them. Keep them out of browser code, mobile binaries, logs, and repositories.
- Public merchant keys beginning with `sup_pk_` are used by client integrations such as Swift Checkout and React Native Checkout. They do not authorize server API calls.
- Sandbox behavior depends on the merchant associated with the credential. Do not infer sandbox or production from the secret key prefix.
- Follow the current API-key guide for available permission controls; do not promise a restricted-key product without checking it is supported.

## OAuth 2.0

Use OAuth for applications acting on behalf of other merchants:

- Authorize endpoint: `https://api.sumup.com/authorize`
- Token endpoint: `https://api.sumup.com/token`
- The documented authorization code flow uses a backend that can keep the client secret confidential. Exchange the short-lived, single-use code from that backend.
- Validate `state` and use the exact registered `redirect_uri` in both authorization and token-exchange requests.
- Submit token requests as `application/x-www-form-urlencoded` and use the returned token with `Authorization: Bearer`.
- Track `expires_in` and refresh tokens as documented. Store any replacement refresh token. An `invalid_grant` requires a new merchant authorization, rather than repeatedly retrying the same refresh token.

Do not assume a PKCE-only public-client flow is supported by these endpoints; implement the flow documented for the selected client and product.

Client credentials authenticate the application without a merchant user. They cannot retrieve merchant-specific transactions or saved customers, but can process payments for merchants linked to the application. This grant does not return a refresh token.

## OAuth scopes

- `payments`: the published OAuth guide's scope for creating and processing checkouts.
- `payment_instruments`: the published OAuth guide's scope for storing customers and tokenizing cards.
- These legacy OAuth scopes require SumUp verification; request them for the OAuth application through [SumUp contact](https://www.sumup.com/contact/).
- Request only the scopes needed by the endpoints and check the granted scopes. Do not apply OAuth scope-activation requirements to API keys or sandbox card-tokenization tests; the saved-card guide permits sandbox testing without additional activation.
- Check each operation's current API reference for its authorization requirements, including newer permission relations. Do not infer that a token can access an operation from its name alone.

## Client origins and affiliate keys

Configure allowed JavaScript origins where required by the selected checkout integration. For terminal integrations, match Affiliate Key configuration to the app's bundle ID or package identifier.

## Payment verification

- Keep PAN/CVV inside the hosted, widget, or SDK-provided payment interface.
- Treat redirects and callbacks as notifications. Retrieve the expected checkout or transaction before fulfillment.
- Follow the webhook protocol for the selected flow; online checkout callbacks do not document HMAC signing.
- Resolve an uncertain payment or refund before submitting another attempt. See `references/response-handling/README.md`.

## Key rotation

1. Issue a new key and store it securely.
2. Deploy it to the intended consumers and verify authentication.
3. Revoke the old key after the cutover succeeds.

## See Also

- `references/react-native-sdk/README.md`
- `references/webhooks-3ds/README.md`
- `references/recurring-tokenization/README.md`
- `references/response-handling/README.md`
