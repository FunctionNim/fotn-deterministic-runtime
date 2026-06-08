# Contributing — Deterministic Runtime Checklist

This repository is a TypeScript + C# deterministic runtime/library. It is not a frontend web app.

The central rule is:

```text
Identical state + identical events must always produce identical consequence.
```

Every contribution should preserve deterministic behavior, audit visibility, replay stability, and snapshot discipline.

## Required Local Verification

Before committing or pushing runtime work, run:

```bash
npm run build
npm test
dotnet build
npm run demo
```

A clean contribution should preserve:

```text
TypeScript build: pass
TypeScript tests: pass
.NET build: pass
Deterministic demo: all proofs YES
Golden snapshot guard: no drift unless intentionally revised
```

## Contribution Checklist

Use this checklist for every runtime change:

```text
[ ] Confirm this belongs in the runtime/library repository.
[ ] Do not add a frontend web app.
[ ] Keep behavior deterministic.
[ ] Add or update a deterministic fixture when behavior changes.
[ ] Add or update tests for new runtime behavior.
[ ] Use the scenario registry for named scenarios when possible.
[ ] Use the runtime signature system for behavior comparison when possible.
[ ] Preserve replay audit visibility.
[ ] Run npm run build.
[ ] Run npm test.
[ ] Run dotnet build.
[ ] Run npm run demo.
[ ] Regenerate golden snapshots only if behavior changed intentionally.
[ ] Explain intentional behavior changes in the commit message or PR description.
[ ] Confirm GitHub Actions passes after push.
```

## Snapshot Discipline

Golden snapshots are not ordinary generated files. They are behavior locks.

Do not update snapshots just to make tests pass.

Only regenerate snapshots when all of the following are true:

```text
[ ] Runtime behavior changed intentionally.
[ ] The new behavior has been reviewed.
[ ] Tests were updated to describe the intended change.
[ ] The commit message explains why the snapshot changed.
```

Intentional snapshot update command:

```bash
npm run generate-snapshot
```

Manifest check:

```bash
npm run verify-manifest
```

## Scenario Registry Rule

Named deterministic scenarios should live behind stable scenario IDs.

Use the scenario registry when adding replayable scenarios so tests, demos, snapshots, and future tools do not depend on scattered imports.

A scenario entry should include:

```text
scenario id
title
phase / act
source domain
description
expected action count
expected memory behavior, if applicable
replay runner or factory reference
```

## Runtime Signature Rule

Use the runtime signature system for structured behavior comparison.

A canonical signature includes:

```text
signatureVersion
scenarioId
actionCount
initialStateHash
inputHash
finalStateHash
auditHash
memoryHash
deterministicProof
combinedHash
```

The signature must not depend on console formatting.

Object key order should not change a signature.
Array order should remain significant.

## Replay Audit Rule

Replay behavior should preserve both result and audit history.

When changing replay logic, check:

```text
same scenario -> same final state
same scenario -> same audit trail
same scenario -> same runtime signature
changed scenario/input -> intentional signature or result change
```

Audit facts should remain structured, ordered, and inspectable.

## Commit Message Guidance

Use clear phase or behavior-oriented commit messages.

Examples:

```text
Add R16 Developer Contribution Checklist
Add replay fixture coverage for pressure transitions
Refactor replay signature generation without behavior change
Update golden snapshot for intentional audit event rename
```

Avoid vague commit messages such as:

```text
fix stuff
updates
misc
```

## Pull Request Guidance

When pull requests are used, include:

```text
Purpose
Files changed
Runtime behavior changed? yes/no
Snapshots changed? yes/no
Tests added or updated
Verification results
Known follow-up
```

## Branch Protection Guidance

Branch protection setup is documented in:

```text
docs/branch-protection.md
```

The intended protected branch is:

```text
main
```

The intended required checks are:

```text
Verification Gate
deterministic-runtime-ci
```

## R16 Lock

```text
PHASE R16 — DEVELOPER CONTRIBUTION CHECKLIST LOCK

Purpose:
Future contributors and agents now have a clear deterministic workflow for changing the runtime safely.

Meaning:
Runtime changes must preserve deterministic behavior, fixture coverage, replay audit visibility, snapshot discipline, and CI verification.
```
