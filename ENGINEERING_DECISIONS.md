# Darik — Engineering Decisions (Public ADR Summary)

The items below are **architecture choices and constraints**, not assertions that every mechanism is in production.

## ADR-001 — Trust deterministic business computation over generative arithmetic
**Context:** Multi-step operational comparisons can appear plausible while using inconsistent timestamps, statuses or currencies.  
**Choice:** Use typed queries and deterministic arithmetic with evidence references; the language model composes explanatory language, not authoritative totals.  
**Trade-off:** Requires domain-specific tooling and test fixtures; reduces unsupported numeric output.

## ADR-002 — Allowlisted tool registry; no model-supplied raw SQL
**Context:** Natural-language models are vulnerable to prompt injection and ambiguous intent.  
**Choice:** Use a tool registry with strict input schemas, role scopes, maximum result ranges and server-enforced tenant context.  
**Trade-off:** New queries must be explicitly modelled as tools/filters; generalized arbitrary querying is intentionally restricted.

## ADR-003 — Prioritize privacy-minimized context
**Context:** Customer-facing workflows include personal or financially sensitive details.  
**Choice:** Redact before provider submission; avoid preserving raw conversation when not strictly necessary. Track every storage location separately.  
**Trade-off:** Minimal context can reduce answer richness and require follow-up clarification.

## ADR-004 — Verify evidence before composing final claims
**Context:** Tool failures, partially synced sources and incorrect date assumptions change business outcomes.  
**Choice:** Validate record count, units, source freshness, pagination completeness, window definitions and empty-versus-error semantics.  
**Trade-off:** Additional latency and compute; safer but sometimes more cautious responses.

## ADR-005 — Make writes opt-in with human oversight
**Context:** An accidental agent action can permanently change an order, inventory or customer record.  
**Choice:** Default read-only; permission + explicit user approval + idempotency + audit + verification for future writes.  
**Trade-off:** Adds human interaction but creates accountable controls.

## ADR-006 — Optimize cost through routing, budgets and testable reuse
**Context:** Sending every business operation through a large LLM is costly and can be slower than structured code.  
**Choice:** Prioritize deterministic/low-cost paths, set per-turn budgets, apply safe reuse only with validated conditions.  
**Trade-off:** Confidence calibration, cache invalidation and freshness must be managed; no specific savings claimed without measured benchmarks.

## ADR-007 — Evidence-driven maturity gates
**Context:** Passing synthetic scenarios alone is not proof of production fitness.  
**Choice:** Require staged integration testing, controlled permissions, failure injection, privacy reviews and sanitized production telemetry before broad rollout.  
**Trade-off:** Slower releases but explicit launch criteria and rollback readiness.

## ADR-008 — Clear Persian response contracts
**Context:** Persian typography, Jalali calendar context and Rial/Toman conventions create ambiguity.  
**Choice:** Normalize input while preserving original meaning; explicitly report chosen timezone, currency and period definitions.  
**Trade-off:** More verbose responses; fewer silent assumptions.

---

For detailed flows and examples, see [ARCHITECTURE.md](ARCHITECTURE.md) and [SECURITY_MODEL.md](SECURITY_MODEL.md).
