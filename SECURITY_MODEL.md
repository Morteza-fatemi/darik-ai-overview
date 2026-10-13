# Darik — Public Security & Privacy Model

> Architectural design guidance only. This is not a penetration-test certificate, data-processing agreement or confirmation that every control is deployed in every environment.

## Assets and trust boundaries

- **Protect:** tenant business records, user identity/role grants, customer PII, orders/prices, provider access tokens, connector credentials, agent plans, prompts, telemetry and administrative actions.
- **Untrusted:** chat text, browser parameters, scraped/retrieved content, LLM suggestions, connector error messages and natural-language summaries.
- **Enforcement points:** authenticated API, permission service, server-side connector adapter, tool schema validator, result verifier and approved audit storage.
- **Central rule:** the language model never grants a permission, chooses its own tenant or authorizes a write.

## Threat scenarios and corresponding controls

| Scenario | Risk | Required design control | How to test |
| --- | --- | --- | --- |
| Cross-tenant read | Data leak | Server-derived tenant context; scoped adapter credentials and filters | Negative tests with tenants A/B |
| Prompt injection in business text | Unapproved tool invocation | Data-as-data boundary; tool allowlist; server permission gate | Adversarial retrieved text |
| Tool argument injection | Unbounded queries or arbitrary filters | Typed strict schemas; allowlisted filter/operators; range limits | Fuzz invalid DSL/query inputs |
| Privilege confusion | Unauthorized management operation | Explicit capability checks and independent confirmation on sensitive writes | RBAC matrix + expired sessions |
| Sensitive data sent to provider | PII disclosure | Redaction/minimization and vendor processing review | Instrument provider payload in controlled test |
| Retained raw conversation | Long-term privacy exposure | Explicit retention/deletion and logging rules | Storage inspection and deletion tests |
| Cache mixing tenants | Cross-tenant response | Tenant/role-aware cache key and scoped invalidation | Cache-isolation regression tests |
| False financial claims | Wrong business decision | Deterministic exact arithmetic and evidence references | Golden data fixtures |
| Infinite agent loop | Excess cost/resource exhaustion | Max steps/tokens/time; per-tenant budget and rate limits | Exhaustion and timeout tests |
| Log/token leakage | Account compromise | Structured redaction and secret scanning; limited access | Adversarial log sample tests |

## Privacy and retention requirements

1. Minimize contextual data **before** model calls; avoid raw IDs, access tokens, addresses and direct contact fields unless essential and explicitly permitted.
2. Capture only business-safe correlation and aggregate usage. Error traces must not copy arbitrary tool responses by default.
3. Define retention separately for chat messages, audit, cache, embeddings, patterns, backups and third-party providers; do not conflate "not storing conversations" with zero retention across all layers.
4. Delete or invalidate personal-data derivatives based on the applicable privacy policy and statutory requirements.
5. Provide a cross-tenant data-access test suite and review the provider privacy terms prior to use.
6. Do not treat a new tool/provider integration as approved until threat-model and access tests pass.

## Authentication, authorization and actions

An interactive request should have an authenticated identity and server-verified permission scope. Access to a **read-only** tool does not imply access to raw source records beyond the minimum needed. A **mutation-capable** tool requires separate permissions, a preview, explicit confirmation, immutable audit metadata and bounded rollback/compensating actions.

All connector access tokens and database identities remain server-side. A client-supplied `tenantId` or model-generated `role` must never override authorization.

## Evidence and verification

For each quantitative answer keep an internal verifiable reference to the query filter, time window, unit, operation, record count and source revision/timestamp. If a provider fails, show *unavailable* rather than zero. If order status, currency or timezone is ambiguous, return clarification or an explicit documented assumption.

## Reporting vulnerabilities

See [SECURITY.md](SECURITY.md). Do not post working exploits, sensitive customer data, internal URLs or credentials in public issues. Report privately to the maintainer.

## Public audit limitations

This repository does not host executable application code, infrastructure-as-code or a production deployment. No source inspection, dynamic penetration test, incident history review or real-data verification is possible from this public overview alone.
