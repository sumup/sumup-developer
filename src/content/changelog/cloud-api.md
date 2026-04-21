---
title: "Cloud API"
tags: ["Cloud API", "API"]
publishedDate: 2025-12-22
---

Today we are announcing the introduction of a new endpoint that lets you receive real-time updates from your connected card reader. You can see the current screen shown during the payment process and check the device status, including battery level, connectivity, and update progress.

Supported States

- `IDLE` – Reader ready for next transaction
- `SELECTING_TIP` – Waiting for tip input
- `WAITING_FOR_CARD` – Awaiting card insert/tap
- `WAITING_FOR_PIN` – Waiting for PIN entry
- `WAITING_FOR_SIGNATURE` – Waiting for customer signature
- `UPDATING_FIRMWARE` – Firmware update in progress

Device Status

- `ONLINE` – Device connected and operational
- `OFFLINE` – Device disconnected (last state persisted)

If you run into issues or need help, please [contact our support team](https://developer.sumup.com/help).
