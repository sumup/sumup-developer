# Python SDK

> Prefer the latest SumUp docs first: `https://developer.sumup.com/online-payments/sdks/python/index.md`
> LLM entrypoint for discovery: `https://developer.sumup.com/llms.txt`

Use `sumup-py`.

## Online: create checkout

```python
checkout = client.checkouts.create(
    CreateCheckoutBody(
        merchant_code=os.environ["SUMUP_MERCHANT_CODE"],
        amount=15.00,
        currency="EUR",
        checkout_reference="order-1001",
    )
)
```

## Card-present: Cloud API

```python
await client.readers.create_checkout(
    merchant_code,
    reader_id,
    CreateReaderCheckoutBody(total_amount=CreateReaderCheckoutBodyTotalAmount(currency="EUR", minor_unit=2, value=1500)),
)
```

## Reading Order

1. This file.
2. `references/checkouts-api/README.md` for online checkout API flow.
3. `references/checkout-widget/README.md` for client UI handoff.
4. `references/webhooks-3ds/README.md` for async confirmation.

## See Also

- `references/checkouts-api/README.md`
- `references/checkout-widget/README.md`
- `references/webhooks-3ds/README.md`
- `references/cloud-api/README.md`
- `references/checkout-playbook.md`
