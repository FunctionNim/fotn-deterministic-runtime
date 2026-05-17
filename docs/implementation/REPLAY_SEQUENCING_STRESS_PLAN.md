# Replay Sequencing Stress Plan

**Project:** Functions of the Nothing  
**Status:** STRESS_VERIFICATION_PLANNED  
**Active Scope:** Functions of the Nothing only  
**Functions of Sophia:** ON HOLD

---

## Purpose

Verify that centralized deterministic runtime authority remains stable under repeated execution.

The runtime has passed the first verification scan for:

- no direct `Guid.NewGuid`
- no direct `DateTime.UtcNow`
- no direct `new DeterministicRuntimeContext`

The next risk is sequencing drift under stress.

---

## Stress Verification Targets

### 1. Replay Frame Ordering

Verify:

- frames remain ordered by deterministic tick
- repeated runs produce matching replay frame output
- replay playback remains stable

---

### 2. Audit Ordering

Verify:

- audit events remain deterministic
- audit event IDs do not drift across equivalent runs
- audit events preserve expected ordering

---

### 3. Mutation Ordering

Verify:

- mutation audit records remain stable
- mutation sequencing does not drift
- before/after hashes remain comparable

---

### 4. Battle Ordering

Verify:

- DamageIntent ordering remains stable
- battle resolution order remains stable
- repeated combat interactions resolve consistently

---

### 5. Stress Iteration Scaling

Initial targets:

- 10 iterations
- 25 iterations
- 50 iterations
- 100 iterations

The runtime should not move toward multiplayer until repeated deterministic stress execution remains stable.

---

## Failure Conditions

Stress verification fails if:

- equivalent runs produce different output
- replay hashes drift
- audit ordering changes
- mutation ordering changes
- battle resolution order changes
- stress runner reports instability

---

## Backend Tooling Reminder

Backend-only systems remain included but dormant:

- Folder of Nothing appendages
- developer zones
- replay diagnostics
- backend audit views
- runtime debug tooling

These remain:

- disabled by default
- non-player-facing
- activation-restricted
- backend-only

---

## Current Best Next Coding Target

Expand DeterministicStressRunner to report:

- iteration count
- replay pass/fail
- mutation pass/fail
- hash pass/fail
- stable/unstable summary

---

## Canon Status

REPLAY_SEQUENCING_STRESS_PLAN_ACTIVE
