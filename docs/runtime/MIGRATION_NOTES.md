# Runtime Migration Notes

## Active Compile Tree

The active deterministic runtime compile tree is:

- `src/FOTN.Engine/`
- `tests/FOTN.Tests/`
- `docs/`

## Legacy Reference Tree

The older top-level `engine/` directory should now be treated as:

- legacy scaffold,
- reference implementation,
- migration source.

It should not be considered the authoritative compile tree unless files are intentionally migrated into `src/FOTN.Engine`.

## Current Runtime Status

The deterministic runtime now successfully passes:

- Restore
- Build
- Test

through GitHub Actions CI.

## Current Runtime Stage

Functions of the Nothing is now in:

`CI-stable deterministic runtime phase`

## Canonical Runtime Law

Nothing is the source.
Continuity is the result.
Meaning is what remains.
