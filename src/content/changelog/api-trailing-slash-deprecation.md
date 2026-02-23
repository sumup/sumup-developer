---
title: "Deprecation of Trailing Slashes in URLs"
tags: ["API", "Deprecation", "Breaking-Change"]
publishedDate: 2025-11-17
---

Today we are announcing the deprecation of support for API requests that include a trailing slash at the end of the URL.
While our documentation has never endorsed this pattern, we identified a small number of clients still relying on it.
To ensure a smooth transition, a 2-month grace period will apply before the behavior is fully removed.

### Details

- Requests using URLs that end with `/` (e.g., `/v0.1/checkouts/`) will continue to work during the grace period.
- After the grace period ends, these requests will return an error.
- Standard, documented URLs without trailing slashes (e.g., `/v0.1/checkouts` ) remain fully supported.

### Timeline

- Deprecation announcement: **17.11.2025**
- Grace period: 2 months
- Removal date: **17.01.2026**

### Required Action

Please consult the [API documentation](https://developer.sumup.com/api) and update any API calls that include a trailing slash.
This change typically only requires removing the final `/` in affected endpoints.

If you run into issues or need help identifying affected requests, please [contact our support team](https://developer.sumup.com/help).
