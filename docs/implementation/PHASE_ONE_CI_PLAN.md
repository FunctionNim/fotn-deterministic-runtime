# Phase One Deterministic CI Plan

**Project:** Functions of the Nothing  
**Status:** PLANNED  
**Functions of Sophia:** ON HOLD

---

## Purpose

This document defines the future deterministic validation workflow for Functions of the Nothing.

The runtime must prove:

- replay stability
- deterministic integrity
- audit consistency
- reproducible combat resolution
- survivable runtime mutation ordering

before multiplayer or large-scale gameplay expansion.

---

## CI Validation Goals

### 1. Replay Regression Validation

Verify:

- identical input logs produce identical replay output
- replay state hashes match
- replay frame ordering remains deterministic

---

### 2. Combat Consistency Validation

Verify:

- DamageIntent ordering remains stable
- battle outcomes remain deterministic
- combat mutation order does not drift

---

### 3. Audit Integrity Validation

Verify:

- audit events remain ordered
- mutation records remain reproducible
- before/after hashes remain valid

---

### 4. Runtime Survivability Validation

Verify:

- invalid actions fail safely
- replay-safe guardrails function correctly
- invalid runtime mutation does not corrupt replay flow

---

## Planned Future Workflow

```text
Commit
→ Build
→ Deterministic Tests
→ Replay Regression Tests
→ Hash Comparison Tests
→ Audit Validation
→ Runtime Validation
→ Pass / Fail
```

---

## Future GitHub Actions Targets

Planned future automation:

- dotnet build
- deterministic runtime tests
- replay comparison tests
- runtime hash verification
- audit ordering checks

---

## Important Restriction

Do not implement multiplayer before deterministic CI validation exists.

Multiplayer without replay-safe validation would violate core project doctrine.

---

## Current Recommended Priority

Implement:

- LegalActionValidator
- RuntimeErrorGuardrails
- replay regression suite

before CI automation.

---

## Canon Status

PHASE_ONE_CI_PLAN_ACTIVE
