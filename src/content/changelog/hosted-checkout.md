---
title: "Hosted Checkout"
tags: ["API", "Online Payments"]
publishedDate: 2026-04-24
---

Hosted Checkout is now available for Online Payments.

Hosted Checkout gives you a SumUp-hosted payment page. Your integration creates the checkout server-side, receives a `hosted_checkout_url`, and redirects the customer to a SumUp-hosted page to complete the payment.

This release is designed for merchants and platforms that want the fastest path to launch online payments without building or hosting their own checkout UI.

What you can do with Hosted Checkout:

- Create a checkout with `hosted_checkout.enabled` set to `true`.
- Redirect customers to the returned hosted payment page.
- Add a `redirect_url` so the success page links back to your website.
- Let SumUp handle the payment page and final status screens while your backend verifies the final state through the API or webhooks.

See the new [Hosted Checkout guide](/online-payments/checkouts/hosted-checkout/) for the full flow, SDK examples, and integration details.
