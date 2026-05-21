# Replay Projection Rules

Replay projection reconstructs deterministic history without altering it.

Projection rules:

- Replay projection must preserve canonical sequencing.
- Replay projection must preserve Information Box hidden timing.
- Replay projection must remain hash-consistent.
- Projection branches are interpretive overlays unless replay-confirmed.
- Replay visualization must not bypass deterministic visibility rules.

Projection mismatch indicates:

- replay divergence,
- visibility corruption,
- invalid timeline reconstruction,
- unauthorized historical mutation.

Replay projection authority depends on deterministic replay truth.
