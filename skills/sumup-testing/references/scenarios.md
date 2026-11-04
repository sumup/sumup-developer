# SumUp Sandbox Scenarios

Read the section for the selected payment flow. Use the linked current documentation if its test data or SDK requirements differ from this reference.

## Core Card Test Data

Default values unless docs specify otherwise:

- CVV: any 3 digits (for example `123`)
- Expiry: any future date (for example `12/30`)
- Cardholder: any name

Happy path cards:

- VISA `4200 0000 0000 0091`
- Mastercard `5200 0000 0000 0007`

3DS challenge cards:

- VISA `4200 0000 0000 0042`
- Mastercard `5200 0000 0000 0015`

## Deliberate Failure Conventions

- Use `11.00` as the documented default decline amount for the selected flow; follow its required major/minor-unit representation.
- For online checkouts, the published test guide also lists `42.01`, `42.76`, and `42.91` as failure amounts.
- For reader-based terminal tests, use the in-person testing guide below. Only its listed `42.xx` values simulate declines; other `42` amounts do not necessarily fail.

## In-person tests

Follow [in-person payment testing](https://developer.sumup.com/terminal-payments/testing/) for Android Reader SDK, iOS Reader SDK, and Cloud API:

- Authenticate the actual sandbox merchant in the app or API; selecting it in the Dashboard alone does not switch SDK login. For native login, use a managed sandbox user or set the sandbox merchant as the user's default before login.
- Physical-reader tests use a supported physical card. Online test card numbers are not needed; the amount determines the simulated result after the card is read.
- Use `10.00 EUR` for success, `11.00 EUR` for a decline, `42.51 EUR` for insufficient funds, `42.55 EUR` for incorrect PIN, and `42.91 EUR` for a simulated timeout.
- Cloud API uses minor units: `42.51 EUR` is `{ "currency": "EUR", "minor_unit": 2, "value": 4251 }`. Wait for the final transaction result; checkout acceptance is not success.
- Use [Virtual Solo](https://virtual-solo.sumup.com/) when a physical reader is unavailable, then validate hardware-specific behavior separately. Simulated failure amounts do not test actual reader disconnection or connectivity loss.

## Tokenization tests

Sandbox merchants can test `SETUP_RECURRING_PAYMENT` through the Payment Widget with test cards and 3DS without extra activation or contacting support. Test saving the card, retrieving its token for the matching customer, a subsequent charge, and deactivation. See [Save Customer Cards](https://developer.sumup.com/online-payments/guides/tokenization-with-payment-sdk/).
