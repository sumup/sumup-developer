# Android Reader SDK (Card-present)

> Prefer the latest SumUp docs first: `https://developer.sumup.com/terminal-payments/sdks/android-sdk/index.md`
> LLM entrypoint for discovery: `https://developer.sumup.com/llms.txt`

## Init + login

```java
SumUpState.init(this);
SumUpLogin login = SumUpLogin.builder("sup_afk_xxx").build();
SumUpAPI.openLoginActivity(this, login, 1);
```

## Optional pre-connection

```java
SumUpAPI.prepareForCheckout();
```

## Start checkout

```java
SumUpPayment payment = SumUpPayment.builder()
  .total(new BigDecimal("12.34"))
  .currency(SumUpPayment.Currency.EUR)
  .title("Coffee")
  .foreignTransactionId(UUID.randomUUID().toString())
  .build();
SumUpAPI.checkout(this, payment, 2);
```

## Reading Order

1. This file.
2. `references/cloud-api/README.md` for backend-driven terminal alternatives.
3. `references/payment-switch/README.md` only for explicit legacy handoff constraints.

## See Also

- `references/ios-terminal-sdk/README.md`
- `references/android-tap-to-pay-sdk/README.md`
- `references/cloud-api/README.md`
- `references/payment-switch/README.md`
- `references/checkout-playbook.md`
