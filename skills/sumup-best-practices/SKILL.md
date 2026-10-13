---
name: sumup-best-practices
description: Pick the right SumUp integration path and apply security best practices. Use when deciding between Hosted Checkout, Card Widget, Checkouts API, mobile SDKs, terminal SDKs, or Cloud API; choosing API key vs OAuth vs restricted keys; or reviewing SumUp integration security.
license: Apache-2.0
---

# SumUp Integration Decisions and Best Practices

Knowledge and APIs can change. Always prefer the latest SumUp docs in markdown format over stale memory.

- Docs root: `https://developer.sumup.com/`
- LLM entrypoint: `https://developer.sumup.com/llms.txt`

Use this skill for architecture and security decisions, not implementation walkthroughs.

## Quick Decision Tree

```text
Need to accept a payment?
├─ In-person (card-present)
│  ├─ Native mobile app controls reader directly -> iOS Terminal SDK / Android Reader SDK
│  ├─ POS/backend controls Solo from non-native environment -> Cloud API
│  └─ Legacy handoff to SumUp app is mandatory -> Payment Switch
└─ Online (card-not-present)
   ├─ Fastest redirect flow, no embed required -> Hosted Checkout
   ├─ Embedded payment form with low PCI scope -> Card Widget
   ├─ Mobile app checkout UX -> Swift Checkout SDK / React Native SDK
   ├─ Save card and charge later -> Customers + tokenization
   └─ Custom orchestration needs -> Checkouts API + 3DS + webhooks
```

## Start Here

1. Classify the request: `terminal`, `online`, or `hybrid`.
2. Choose the lowest-complexity viable path first:
   - Prefer Hosted Checkout or Card Widget before custom orchestration.
   - Prefer Cloud API for non-native Solo control.
3. Select auth model:
   - API key for single-merchant server integrations.
   - OAuth 2.0 for delegated or multi-merchant apps.
4. Confirm restricted access and affiliate prerequisites:
   - `payments` scope activation where needed.
   - Affiliate Key plus app/bundle identifier alignment for card-present.
5. Confirm operational constraints:
   - Currency/merchant alignment
   - Webhook endpoint readiness and idempotency
   - Legacy compatibility requirements

## Non-Negotiable Rules

- Keep API keys and OAuth secrets server-side only.
- Never handle raw PAN/card details directly.
- Create online checkouts server-to-server.
- Prefer hosted/widget/SDK checkout UI over custom card handling.
- Avoid deprecated endpoints.
- Use unique transaction references (`checkout_reference`, `foreignTransactionId`, or equivalent).
- Treat webhook callbacks as signals and verify final state via API before fulfillment.
- Assume retries and duplicate deliveries; enforce idempotent backend handling.

## Required Response Contract

When giving guidance, always return:

1. Chosen integration path with a brief why.
2. Credential model recommendation (API key vs OAuth) and scope requirements.
3. Security posture checklist for the chosen path.
4. Risks/trade-offs and when to pick a different path.
5. Minimum validation plan before production rollout.

## Hand-off to Implementation Skills

- Use `sumup` for end-to-end implementation steps.
- Use `upgrade-sumup` for SDK/API migrations.
- Use `sumup-debug` for failure diagnosis.
- Use `sumup-testing` for sandbox and QA setup.
