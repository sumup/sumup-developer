---
title: "Android Tap-to-Pay 1.1.5"
tags: ["Android Tap-to-pay SDK", "Android", "SDK"]
publishedDate: 2026-07-23
---

*We recommend updating to this version of the SDK for security enhancements.*

### New Features
- Added optional `timeoutCardWaitSeconds` to `startPayment`, allowing integrators to configure how long the SDK waits for card presentation.
- The default card-wait timeout is now 240 seconds. Supported values are clamped between 60 and 240 seconds.
- Updated SDK build support for Android 16 / API 36.
- Updated core security, attestation, obfuscation, and payment kernel dependencies.

### Fixes
- Fixed an issue where rotating the device during an active transaction could interrupt the payment flow.
- Fixed a recovery issue where transactions could keep failing with “Could not connect to the server” after a temporary network failure until the app was restarted.
- Improved NFC card-read handling by retrying after supported L1 read errors.

### Integration Notes
- Existing integrations continue to work without code changes.
- Integrators can optionally pass `timeoutCardWaitSeconds` when starting a payment to customize the card presentation timeout.
