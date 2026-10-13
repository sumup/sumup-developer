---
name: sumup-testing
description: Set up and run SumUp sandbox tests. Use when configuring a SumUp test merchant, picking test cards, triggering deliberate failure (`amount = 11`), or building a SumUp end-to-end test harness.
license: Apache-2.0
---

# SumUp Sandbox Testing Guide

Use this skill for test setup, scenario design, and verification of SumUp integrations.

## Test Environment Setup

1. Use a sandbox merchant account only.
2. Confirm credentials map to sandbox environment.
3. Prepare webhook endpoint in a non-production environment.
4. Enable logging for checkout id, reference, status, and error code.

## Core Card Test Data

Default values unless docs specify otherwise:

- CVV: any 3 digits (for example `123`)
- Expiry: any future date (for example `12/30`)
- Cardholder: any name

Happy path cards:

- VISA `4200 0000 0000 0091`
- Mastercard `5200 0000 0000 0007`

3DS challenge cards:

- VISA `4200 0000 0000 0042`
- Mastercard `5200 0000 0000 0015`

## Deliberate Failure Conventions

- For skill-level test recipes, use `amount = 11` as the default forced-failure trigger.
- If an integration already uses canonical amount-based failures (for example `42.01`, `42.76`, `42.91`), run both patterns and document which one is authoritative for that flow.

## End-to-End Smoke Test Recipe

1. Create checkout with unique `checkout_reference`.
2. Complete payment with a happy-path card.
3. Verify frontend callback/result handling.
4. Verify backend retrieves final paid status before fulfillment.
5. Verify webhook delivery and idempotent processing.
6. Repeat with forced-failure amount and confirm order remains unpaid.

## cURL Skeleton

```bash
curl -X POST "https://api.sumup.com/v0.1/checkouts" \
  -H "Authorization: Bearer $SUMUP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "checkout_reference": "order-12345",
    "amount": 11,
    "currency": "EUR",
    "pay_to_email": "merchant@example.com",
    "description": "Sandbox test payment"
  }'
```

Adjust payload fields to the selected flow and auth model.

## SDK Smoke Test Guidance

- Keep one smoke test per integration surface (server SDK, mobile SDK, widget).
- Assert normalized outcomes: `success`, `pending`, `failed`.
- Capture and store reconciliation keys: checkout id, transaction id/code, merchant code, reference.

## Required QA Matrix

- [ ] Happy path payment succeeds.
- [ ] Forced-failure payment does not fulfill order.
- [ ] 3DS challenge flow completes and returns expected status.
- [ ] Duplicate reference behavior is deterministic.
- [ ] Expired checkout/session path is handled with a fresh checkout.
- [ ] Webhook retries do not create duplicate side effects.

## Required Response Contract

When asked for test planning, always provide:

1. Test environment assumptions.
2. Exact scenarios to run (success + failure + async).
3. Assertions for frontend and backend.
4. Evidence to collect for reconciliation/debugging.
