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
engine/       Additional engine modules
FOTN/         C# engine core
src/FOTN.Engine/   C# engine library (.csproj)
tests/FOTN.Tests/  C# test project (.csproj)
prototype/    CLI and stress-runner entry points
docs/         Doctrines, architecture, and canon documentation
dist/         TypeScript compiled output
```

## Key Commands

```bash
npm run build       # Compile TypeScript
npm test            # Run all TypeScript tests (vitest)
dotnet build FOTN.DeterministicRuntime.sln   # Build C# solution
dotnet test FOTN.DeterministicRuntime.sln    # Run C# tests
```

## Deterministic Law

Identical state + identical events must always produce identical consequence.

## User Preferences

(none yet)
