---
title: "Python SDK"
tags: ["SDK", "Python"]
publishedDate: 2025-08-02
---

We are happy to announce the release of our [Python](https://www.python.org/) SDK. The SDK is maintained under [sumup/sumup-py](https://github.com/sumup/sumup-py) and covers all of SumUp's public APIs. `sumup-py` support both synchronous and asynchronous calling convention.

```py
import os
import asyncio

from sumup import AsyncSumup
from sumup.readers.resource import CreateReaderCheckoutBody, CreateReaderCheckoutBodyTotalAmount


async def main():
    client = AsyncSumup()
    merchant_code = os.environ["SUMUP_MERCHANT_CODE"]

    readers = await client.readers.list(merchant_code)
    reader = readers.items[0]

    checkout = await client.readers().create_checkout(
        merchant_code,
        reader.id,
        CreateReaderCheckoutBody(
            total_amount=CreateReaderCheckoutBodyTotalAmount(
                currency="EUR",
                minor_unit=2,
                value=1000,
            ),
            description="sumup-py card reader checkout example",
        ),
    )

    print(checkout)


if __name__ == "__main__":
    asyncio.run(main())
```

See the repository for more [examples](https://github.com/sumup/sumup-py/main/examples) and don't hesitate to [let us know](/contact) if you have any questions.
