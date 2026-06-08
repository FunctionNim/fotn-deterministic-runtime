# Functions of the Nothing — Deterministic Runtime

## Overview

A dual-language (TypeScript + C# .NET 8) deterministic game engine and simulation runtime. The core doctrine: **Pressure → Function → Consequence → Audit → Meaning**. The runtime simulates consequence, not animation.

## Tech Stack

- **TypeScript** (Node.js 20, ES2022, `NodeNext` modules)
- **C# / .NET 8** — engine library and test project
- **Vitest** — TypeScript test runner
- **MSBuild / dotnet CLI** — C# build system

## Project Layout

```
src/          TypeScript source (runtime, combat, civilization, etc.)
tests/        TypeScript and C# tests
tests/golden/ Golden snapshot and audit manifest (Phase R4)
engine/       Additional engine modules
FOTN/         C# engine core
src/FOTN.Engine/   C# engine library (.csproj)
tests/FOTN.Tests/  C# test project (.csproj)
scripts/      Snapshot generation and manifest verification tools
prototype/    CLI and stress-runner entry points
docs/         Doctrines, architecture, and canon documentation
dist/         TypeScript compiled output
```

## Key Commands

```bash
npm run build            # Compile TypeScript
npm run typecheck        # Type-check without emit
npm test                 # Run all TypeScript tests (vitest) — 141 checks
npm run demo             # Run the Phase R2 deterministic demo (both acts)
npm run generate-snapshot  # Intentionally regenerate the golden snapshot
npm run verify-manifest  # Print manifest + live drift report

dotnet build FOTN.DeterministicRuntime.sln   # Build C# solution
dotnet test FOTN.DeterministicRuntime.sln    # Run C# tests
```

## Deterministic Law

Identical state + identical events must always produce identical consequence.

## CI Verification Gate (Phase R5)

Every push and pull request runs the **Verification Gate** workflow defined in `.github/workflows/ci.yml`. It runs two parallel jobs:

| Job | Steps |
|---|---|
| TypeScript | `npm ci` → `npm run build` → `npm run typecheck` → `npm test` → `npm run demo` |
| .NET 8 | `dotnet restore` → `dotnet build` → `dotnet test` |

**Golden snapshot protection:** `tests/golden/r2-demo-snapshot.json` is committed to source and read by CI. CI **never** generates or updates it. If the live fixture output diverges from the snapshot, `npm test` fails with a clear drift message. To update the snapshot intentionally, run `npm run generate-snapshot` locally and commit the result.

A complementary `.NET`-only gate also runs via `.github/workflows/deterministic-runtime-ci.yml`.

## User Preferences

(none yet)
