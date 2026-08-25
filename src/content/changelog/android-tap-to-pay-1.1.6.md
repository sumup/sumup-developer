---
title: "Android Tap-to-Pay 1.1.6"
tags: ["Android Tap-to-pay SDK", "Android", "SDK"]
publishedDate: 2026-08-25
---

### New Features

- Redesigned the payment UI (success, error, warning, loading, and tap-card screens), including updated animations and PIN-pad styling.
- When a presented card cannot be used, the SDK now prompts the cardholder to try another card instead of failing the payment immediately.
- After repeated unsuccessful “try another card” attempts, the payment fails with `PaymentException.CardErrorNotAccepted` (code `1029`).

### Fixes

- Fixed an issue that could send the charge request twice after a network interruption.
- Fixed an issue where a transaction that had already failed on the backend might not notify the integrator with `TransactionFailed`.
- Fixed a PIN-pad issue on some devices where digit 0 was not visible.

### Integration Notes

- The **Send receipt** button has been removed from the SDK success screen. Receipts must be handled by the host app if required.
- `PaymentFlowClosedSuccessfully.shouldDisplayReceipt` is deprecated, always emitted as `false`, and will be removed in **1.1.7**. Existing two-argument constructors still compile.
- `skipSuccessScreen` is unchanged. Hosts that already show their own success UI are unaffected.
- If you use an exhaustive `when` on `PaymentException`, add a branch for `PaymentException.CardErrorNotAccepted`.

### Important — dependency and toolchain

- The SDK is now built with **Kotlin 2.2.21**. Host apps compiling with Kotlin **1.9.x** are likely to fail with a Kotlin metadata version mismatch. Upgrade the host Kotlin Gradle plugin to **2.0+** (2.2.x recommended) before integrating 1.1.6.
