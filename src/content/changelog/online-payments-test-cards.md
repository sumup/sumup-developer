---
title: "Online Payments Test Cards"
tags: ["API"]
publishedDate: 2026-03-10
---

We have updated sandbox testing for Online Payments to use a dedicated set of test cards.

This affects all Online Payments integrations tested with sandbox merchant accounts.

What changed:

- Sandbox testing now relies on predefined test card numbers.
- The test set covers successful payments, payment failures, and 3D Secure scenarios.

Migration note: update your QA flows to use the documented test cards and expected outcomes.

See [Testing online payments](/online-payments/testing/) for setup steps, card numbers, and expected behavior.
