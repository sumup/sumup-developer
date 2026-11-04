---
name: upgrade-sumup
description: Upgrade SumUp server or mobile SDKs, migrate deprecated endpoints, and assess release compatibility. Use for dependency bumps or migrations involving @sumup/sdk, Go, Python, PHP, Java, Rust, .NET, reader SDKs, Tap to Pay, React Native, or Swift Checkout.
license: Apache-2.0
---

# Upgrade a SumUp Integration

## Establish the target

Inspect the affected dependency manifests, lockfiles, client configuration, and used endpoints. Honor the user's requested version. When asked for the latest release, verify it through the SDK's official repository or registry and [SumUp release notes](https://developer.sumup.com/changelog/); do not treat a bundled version example as current.

State the selected target and source. If current release information is unavailable, identify what remains unverified rather than guessing a version. Preserve stable versus prerelease choices and avoid downgrades or unrelated package upgrades unless requested.

## Compare the affected contracts

- Read release and migration notes between the installed and target versions. Verify method names, request models, response fields, error types, and runtime/toolchain requirements against the target SDK.
- Check endpoint deprecations, merchant parameters, permissions, callback protocols, and asynchronous result behavior only where the integration uses them.
- Treat Swift Checkout as a web JavaScript SDK and Android Tap-to-Pay as a separate package from the Android Reader SDK. React Native Checkout has an alpha API; verify the selected release's signatures.
- When crossing Android Tap-to-Pay 1.1.7, check its required affiliate metadata, removed `shouldDisplayReceipt` field, and changed R8/ProGuard rules. Read the exact release notes rather than applying those changes to unrelated SDKs.

Find current SDK guides through the [documentation index](https://developer.sumup.com/llms.txt) and endpoint contracts through the [API index](https://developer.sumup.com/api/llms.txt) or [OpenAPI specification](https://developer.sumup.com/openapi.json).

## Implement and validate the migration

Change the affected SDK or endpoint and its callers. Update the lockfile, fix incompatible types and behavior, and regenerate any clients from their authoritative source where needed. Follow the dependency order required by that migration; do not force a server/mobile/UI upgrade sequence onto a single-package change.

Preserve payment-state safeguards: verify the final checkout or transaction before fulfillment, make order updates idempotent, and reconcile uncertain payments or refunds before repeating them. Keep callback verification specific to the selected product; not every SumUp webhook documents signatures.

Run focused project checks for the changed contracts. For payment-flow changes, include relevant sandbox success and decline tests (`11.00` where documented), and changed 3DS, callback, cancellation, or uncertain-result behavior. For native SDKs, check the affected platform and release build; local tests alone cannot verify a reader or provider flow.

Report the resulting version and behavior, checks actually run, and any compatibility or provider validation still outstanding. Include rollout or rollback steps when deployment risk warrants them; do not require a production rollout plan for a small version question or unrelated repository cleanup.
