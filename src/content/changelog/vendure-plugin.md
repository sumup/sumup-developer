---
title: "Vendure Plugin"
tags: ["Plugin", "Online Payments"]
publishedDate: 2026-06-11
---

The SumUp plugin for [Vendure](https://vendure.io/) is now available.

The plugin adds SumUp as a payment integration for Vendure and supports:

- Hosted Checkout for redirect-based payments
- Widget-oriented storefront integrations that use a returned `checkoutId`
- Webhook-driven payment updates through Vendure's payment flow

To get started, install `@sumup/vendure-plugin`, register `SumUpPlugin` and `sumUpPaymentHandler` in your Vendure config, and create a `sumup` payment method in Vendure Admin.

See the new [Vendure plugin guide](/online-payments/plugins/vendure/) for setup steps, configuration options, and testing guidance.
