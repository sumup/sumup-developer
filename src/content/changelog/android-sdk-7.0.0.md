---
title: "Android SDK 7.0.0"
tags: ["Android SDK", "Android", "SDK"]
publishedDate: 2026-03-02
---

[Android SDK](https://github.com/sumup/sumup-android-sdk) 7.0.0 has been [released](https://github.com/sumup/sumup-android-sdk/releases/tag/v7.0.0).

**Added:**

- `successScreenTimeout` in the payment builder to configure the duration of the success screen.
- `getSavedCardReaderDetails()` to retrieve details of the saved card reader (serial number, type, and battery percentage).
- `isCardReaderConnected()` to check if a card reader is currently connected.

**Improvements:**

Introduction of Offline transaction V2

- Changes the API and behavior about how offline transactions work.
- Explicit APIs to start and stop the offline session.
- Removal of Security Patch Validity API.
- Please have a look at [OFFLINE_PAYMENTS_V2.md](https://github.com/sumup/sumup-android-sdk/blob/master/OFFLINE_PAYMENTS_V2.md) for more information.
