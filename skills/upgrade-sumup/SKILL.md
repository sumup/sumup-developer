---
name: upgrade-sumup
description: Guide for upgrading SumUp API versions and server/mobile SDKs (@sumup/sdk, sumup-go, sumup Python, PHP, Java, Rust, .NET, iOS Terminal, Android Reader, Swift Checkout, React Native). Use when bumping SumUp SDK versions or migrating off deprecated endpoints.
license: Apache-2.0
---

# SumUp Upgrade and Migration Guide

Knowledge and APIs can change. Always prefer current official docs and release notes.

- Docs root: `https://developer.sumup.com/`
- LLM entrypoint: `https://developer.sumup.com/llms.txt`

Use this skill when the request is about upgrades, version bumps, deprecations, or migrations.

## Supported Upgrade Targets

- Node: `@sumup/sdk`
- Go: `sumup-go`
- Python: `sumup`
- PHP, Java, Rust, .NET SDK/client integrations
- iOS Terminal SDK
- Android Reader SDK
- Swift Checkout SDK
- React Native SDK
- Checkouts API and related webhook/3DS endpoint usage

## Upgrade Workflow

### 1) Pre-upgrade inventory

Capture:

- Current SDK/library versions by service/app.
- All used SumUp endpoints and fields.
- Auth mode (API key/OAuth), scopes, and webhook signature setup.
- Environments impacted (sandbox, staging, production).

### 2) Breaking-change diff

For each SDK or endpoint migration:

- Compare changelog and migration notes.
- Identify renamed/removed fields, enums, and callback signatures.
- Identify behavior changes in async/payment status semantics.
- Identify deprecated endpoints and required replacements.

### 3) Migration implementation

- Upgrade one surface at a time (server SDK, then mobile SDK, then UI integration).
- Keep a compatibility adapter where necessary to isolate application code from SDK changes.
- Replace deprecated endpoints with current equivalents, preferring endpoints that accept `merchant_code` where applicable.
- Keep webhook verification and idempotency logic unchanged unless required.

### 4) Post-upgrade validation

- Run happy path payment in sandbox.
- Run deliberate failure (`amount = 11`) and verify order state remains unpaid.
- Verify 3DS redirect/challenge and return handling.
- Verify webhook retries and idempotent processing.
- Verify duplicate reference behavior and reconciliation fields.

### 5) Rollout and rollback

- Roll out in stages (internal -> low-volume -> full traffic).
- Add release toggles where practical.
- Keep previous version rollback path ready until metrics are stable.

## Migration Checklist

- [ ] All deprecated SumUp endpoints removed from active code paths.
- [ ] SDK major/minor versions pinned consistently across services/apps.
- [ ] Any generated API clients re-generated and committed.
- [ ] Integration tests updated for new response shapes.
- [ ] Runbook updated with new status/error codes.
- [ ] Monitoring alerts reviewed for new failure signatures.

## Required Response Contract

Every upgrade answer should include:

1. Current state summary and target version.
2. Breaking changes and affected code surfaces.
3. Minimal safe migration sequence.
4. Validation plan including forced-failure path.
5. Rollback strategy and go/no-go criteria.
