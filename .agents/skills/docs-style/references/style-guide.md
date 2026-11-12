# SumUp Developer Portal: docs style guide (v0.1, draft)

**Status:** Draft for the DevPortal Engineering Standards Forum. Not yet ratified.  
**Benchmark:** Stripe docs. Clear, consistent, informative, accessible.  
**Applies to:** Guide pages on [developer.sumup.com](https://developer.sumup.com/). Not the API reference or changelog.

---

## The rules

### Voice (V)

- **V1. Talk to the developer.** Use "you" and "your". Avoid "the user" when you mean the developer.
- **V2. Use the imperative for steps.** "Create a checkout", not "You will need to create a checkout" or "The next step is creating a checkout".
- **V3. No "we", "our" or "us".** Use "SumUp" only when stating a SumUp policy or behavior ("SumUp retries failed webhooks...").
- **V4. No filler or politeness.** Cut "please", "please note", "simply", "just", "easy", "of course", "at this time", "in order to".
- **V5. No marketing.** Guides explain how. Remove claims like "stand out from your competitors", "seamless", "secure and safe manner", "powerful".
- **V6. State limits plainly.** "Local testing isn't supported. Use a staging domain." not "This is not possible at the moment."
- **V7. No analogies or jokes.** They don't translate and they age badly.
- **V8. Present tense, active voice.** "The SDK returns an error", not "An error will be returned".

### Terminology (T)

Use these exact terms. Flag any variant.

| Use                                                                                    | Not                                                               |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| merchant code                                                                          | merchant ID, MID, MXXXXX                                          |
| sandbox merchant account                                                               | Sandbox Merchant Account, test account                            |
| secret API key / public API key                                                        | secret key, private key, API Key                                  |
| affiliate key                                                                          | Affiliate Key, Affiliate key                                      |
| access token                                                                           | auth token, bearer token (except when naming the `Bearer` scheme) |
| Reader SDK _(pending forum decision vs Mobile SDK)_                                    | Terminal SDK, native SDK                                          |
| Payment Widget, Hosted Checkout, Swift Checkout, Cloud API, Payment Switch, Tap to Pay | Card Widget, Tap-to-Pay, TTP, SumUp API Payment Switch            |
| in-person payments                                                                     | terminal payments, card-present payments (fine once as an alias)  |
| online payments                                                                        | e-commerce, ecom                                                  |
| SumUp Dashboard                                                                        | me.sumup portal, the portal                                       |
| iDEAL, BLIK, Pix, PayPal                                                               | iDeal, Blik, PIX                                                  |
| Czechia                                                                                | Czech Republic                                                    |

- **T1.** Use the terms above.
- **T2.** Spell out an acronym on first use: "alternative payment methods (APMs)". Common ones (API, SDK, URL, HTTP) don't need it.
- **T3.** US English (authorize, behavior, canceled).
- **T4.** Product names are capitalized. Generic objects are not: "a merchant", "a checkout", "a person", not "a Merchant".
- **T5.** Dashboard paths use bold and `>`: **Settings** > **Developers** > **API keys**. Use the exact labels from the current Dashboard, and link the page once.

### Structure (S)

- **S1. Guide skeleton.** Task guides use this order. Skip a section only if it really doesn't apply.
  1. One or two sentences: what this does and when to use it
  2. **Before you begin** (accounts, keys, versions, hardware)
  3. Numbered steps
  4. **Test your integration** (what to check, link to the testing guide)
  5. **Next steps** (2 to 4 links)
- **S2. Sentence-case headings.** "Create a checkout", not "Create a Checkout".
- **S3. Task headings are imperative.** "Handle the response", not "Handling the Response" or "Response handling".
- **S4. One task per page.** Over ~1,500 words of prose usually means two pages.
- **S5. One idea per step.** If a step has "and then", split it.
- **S6. Callouts are rare.** Use **Note** (useful context), **Caution** (can break the integration), **Warning** (money, security, or data loss). No more than one callout per section. Never "Tip" for required behavior.
- **S7. Use real links.** Link the first mention of another product or guide. Use descriptive link text, never "here" or "this page".
- **S8. Point out when you leave SumUp.** If a step happens in Apple, Google or another third-party system, say so: "In the Google Pay console, ...".

### Accessibility (A)

- **A1. Short sentences.** Aim for under 25 words. One idea each.
- **A2. Write for non-native English readers.** Avoid idioms ("up and running", "out of the box").
- **A3. Images need alt text** that says what the image shows and why it matters.
- **A4. Tables are for comparing.** Don't use a table for a single list of values.
- **A5. Don't rely on position or color.** Not "the button on the right" or "the green status".

### Code samples (C)

- **C1. Server-side API calls show every supported language.** cURL, JavaScript, .NET, Java, Go, Python, Rust, PHP. If one isn't supported, say so.
- **C2. Use correct fence languages.** `bash`, `ts`, `js`, `json`, `swift`, `kotlin`, etc. Use one name per language (not both `js` and `javascript`).
- **C3. Placeholders are obvious and consistent.** `sup_sk_your_api_key`, `MERCHANT_CODE`, `CHECKOUT_ID`, `READER_ID`.
- **C4. Use the standard environment variables.** `SUMUP_API_KEY`, `SUMUP_MERCHANT_CODE`. Flag anything else for the author to confirm.
- **C5. Introduce every code block** with one sentence saying what it does. Follow request examples with the expected response or result.
- **C6. Never show a real key, token or merchant code.**

### Accuracy flags (F)

The reviewer can't verify these, but should flag them as questions:

- **F1.** Version numbers, OS and tool minimums (Xcode, iOS, Android API level)
- **F2.** Country or market availability lists
- **F3.** Timeouts, retry schedules, expiry windows
- **F4.** Endpoints using a version prefix different from nearby pages

---

## Before and after (real examples from the portal)

| Before                                                                                                               | After                                                                                                               | Rules  |
| -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------ |
| "Please note that you can also offer Apple Pay through our Payment Widget."                                          | "You can also offer Apple Pay through the [Payment Widget](...)."                                                   | V3, V4 |
| "Our recommendation would be to silently ignore unknown events."                                                     | "Ignore event types you don't recognize."                                                                           | V2, V3 |
| "Google demands screenshots for the onboarding process, but you don't have the integration ready yet? Simply add..." | "Google requires screenshots during onboarding. To show the button before your integration is ready, add..."        | V4, V7 |
| "This is not possible at the moment."                                                                                | "Local testing isn't supported. Use a staging domain verified in the Google Pay console."                           | V6     |
| "Provide your merchant ID (MXXXXX)."                                                                                 | "Provide your merchant code."                                                                                       | T1     |
| "## Setting up a Sandbox Merchant Account"                                                                           | "## Set up a sandbox merchant account"                                                                              | S2, S3 |
| "APMs offer familiar and frictionless payment experiences... making you stand out from your competitors."            | "Alternative payment methods (APMs) let customers pay with methods common in their country, such as iDEAL or BLIK." | V5, T2 |

---

## Reference pages

When in doubt, match these:

- [Get started](https://developer.sumup.com/get-started/)
- [Hosted Checkout](https://developer.sumup.com/online-payments/checkouts/hosted-checkout/)
- [Response handling](https://developer.sumup.com/online-payments/guides/response-handling/)
- [API keys](https://developer.sumup.com/tools/authorization/api-keys/)

---

## Open decisions (forum)

- Canonical SDK name: **Reader SDK** or **Mobile SDK**
- Canonical Dashboard path labels (today 4 variants exist)
- Whether to enforce these rules with a prose linter (e.g. Vale) in docs CI
- Who owns this guide and approves changes
