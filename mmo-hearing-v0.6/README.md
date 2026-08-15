# FOTN MMO Persistence Hearing v0.6 — CI Payload

Status: EVIDENCE-ONLY / NON-PRODUCTION / NO MMO WORLD-RUNTIME PROMOTION

This isolated branch carries the exact CI-slim archive of FOTN MMO Determinism Lab v0.6 for live persistence qualification. It does not replace the repository runtime and must not be merged as gameplay canon by implication.

## Fixture authority

- Blue Maze River canon: owner-accepted Make-Believe Completion Canon v1.0.
- Enriched fixture: two visits, 12 ordered events.
- Carry-forward stabilization requires explicit proof of which prior reusable field/value is actually reused by the new ACT.
- Post-STABILIZED behavior is a technical no-inference hold: evidence may append, but this lab does not invent a degradation state, seventh page state, or new canon transition.
- Expected enriched fixture final hash: `53ea6e6396f922f72e01096d8838fbf8f64794cdcbc04ae372de7f9d0b15eb79`.

## Archive integrity

Full v0.6 archive SHA-256:
`db81c848c36cfef322682d67b09dd36fc01b11f2887053d683929b41ec836339`

CI-slim archive SHA-256:
`aa535a41683096d9bf5056b4ab7502da7821a23b811ff6871e3b4531f6710919`

The CI-slim ZIP is base64-split across `payload.part1.b64` through `payload.part4.b64`. The workflow concatenates and verifies it before execution.

## Hearing law

PostgreSQL and KurrentDB must run the same enriched Blue fixture and the same classes of evidence: ordered append/read, expected-revision conflict, idempotent retry, snapshot + tail replay, concurrent single-winner append, restart durability, and p50/p95/p99 append latency.

Persistence Comparison Hearing 001 may OPEN only if both live gates PASS. Opening the hearing does not select a winner. Database promotion requires a separate evidence review / owner acceptance.
