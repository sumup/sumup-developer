---
title: "TypeScript / JavaScript SDK"
tags: ["SDK", "JavaScript"]
publishedDate: 2025-06-22
---

We are happy to announce the release of our [TypeScript](https://www.typescriptlang.org/) / [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) SDK. The SDK is maintained under [sumup/sumup-ts](https://github.com/sumup/sumup-ts) and covers all of SumUp's public APIs.

The SDK provides easy access to SumUp APIs:

```ts
import SumUp from "@sumup/sdk";

const client = new SumUp({
  apiKey: process.env.SUMUP_API_KEY,
});

async function main() {
  const merchantCode = process.env.SUMUP_MERCHANT_CODE;
  if (!merchantCode) {
    console.warn(
      "Missing merchant code, please specify merchant code using SUMUP_MERCHANT_CODE env variable.",
    );
    return;
  }

  const { items: readers } = await client.readers.list(merchantCode);
  if (!readers.length) {
    console.warn("No readers found, please pair a card reader first.");
    return;
  }

  const reader = readers[0];

  const checkout = client.readers.createCheckout(merchantCode, reader.id, {
    total_amount: {
      // Must match the currency of your merchant account
      currency: "EUR",
      minor_unit: 100,
      value: 500,
    },
  });

  console.info({ checkout });
}

main();
```

See the repository for more [examples](https://github.com/sumup/sumup-go/main/examples) and don't hesitate to [let us know](/contact) if you have any questions.
