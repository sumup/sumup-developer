---
title: "Android Tap-to-Pay 1.1.7"
tags: ["Android Tap-to-pay SDK", "Android", "SDK"]
publishedDate: 2026-10-28
---

*We recommend updating to this version of the SDK for security enhancements.*

### Security

- Updated OkHttp to 4.12.1 to address CVE-2026-111943. This protects the SDK's network connections, including on devices without Google Play services.
- Updated core security, code protection, and payment kernel dependencies.

### New Features

- Added support for JCB cards.
- `TransactionFailed.tapToPayException` now includes the backend error details. `PaymentException.ErrorAction` has new `acquiringErrorTextId` and `acquiringErrorDescription` fields.
- Preparation for Girocard support, rolling out in coming weeks.

### Fixes

- Fixed a crash (`NoSuchMethodError`) on the SDK's first network request in host apps built with R8 obfuscation. This affected versions 1.1.5 and 1.1.6.
- When the card type (credit/debit) doesn't match, the cardholder can now re-tap up to 3 times, as intended, instead of once.
- Fixed a crash when the PIN entry security library failed to load. The payment now fails with an error instead.
- Improved reliability on devices that don't deliver sensor events.
- Fixed an out-of-memory issue caused by metrics recording.

### Integration Notes

- `CheckoutData.affiliateData` is now required. Pass an `AffiliateModel` with your app's affiliate key so transactions are attributed to your integration.
- `PaymentFlowClosedSuccessfully.shouldDisplayReceipt` has been removed, as announced in 1.1.6. Remove any references to it.
- The SDK's consumer ProGuard rules no longer disable code shrinking (`-dontshrink`) or apply global keep rules to all enums and native methods in your app. If your release build relied on these, test it before shipping.
