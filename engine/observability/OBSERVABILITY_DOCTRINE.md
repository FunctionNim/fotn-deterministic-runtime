# Observability Doctrine

Observability interprets deterministic state without mutating it.

Rules:

1. Observability may read runtime state.
2. Observability may read audit history.
3. Observability may read replay frames.
4. Observability may analyze pressure state.
5. Observability must never mutate simulation state.
6. Observability output is interpretation, not authority.

Purpose:

The observability layer supports Gold interpretation, replay analysis, pressure tracing, causality visibility, and player-facing explanation.
