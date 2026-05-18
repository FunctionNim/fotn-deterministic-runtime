# Canonical Encoding Rules

Canonical encoding exists to guarantee replay-safe deterministic state identity.

Encoding Rules:

1. All collections must be encoded in deterministic order.
2. Entity identifiers must be sorted before encoding.
3. Null handling must remain stable across platforms.
4. Floating point values are forbidden unless normalized.
5. Timezone-sensitive formatting is forbidden.
6. Runtime memory addresses must never appear in encoded state.
7. Presentation state is excluded from canonical encoding.

Canonical encoding output is simulation truth only.
