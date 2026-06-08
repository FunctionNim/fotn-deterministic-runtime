/**
 * snapshot-registry-lint.test.ts
 *
 * Validates scripts/snapshot-registry.json against
 * scripts/snapshot-registry.schema.json using ajv (JSON Schema draft-07).
 *
 * Catches typos and structural errors in the registry file as early as
 * possible — during `npm test` — before the coverage check script runs.
 *
 * Rules enforced by the schema:
 *   - Keys starting with "_" (metadata) may hold any value.
 *   - All other keys must map to a non-empty string (the npm script name).
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Ajv } from 'ajv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const registryPath = join(root, 'scripts', 'snapshot-registry.json');
const schemaPath = join(root, 'scripts', 'snapshot-registry.schema.json');

const registry = JSON.parse(readFileSync(registryPath, 'utf-8')) as unknown;
const schema = JSON.parse(readFileSync(schemaPath, 'utf-8')) as object;

describe('snapshot-registry.json schema lint', () => {
  it('conforms to snapshot-registry.schema.json (all non-_ values are non-empty strings)', () => {
    const ajv = new Ajv({ strict: false });
    const validate = ajv.compile(schema);
    const valid = validate(registry);

    if (!valid) {
      const errors = (validate.errors ?? [])
        .map((e: import('ajv').ErrorObject) => `  • ${e.instancePath || '(root)'}: ${e.message}`)
        .join('\n');
      expect.fail(
        `scripts/snapshot-registry.json failed schema validation:\n${errors}\n\n` +
        `Every non-comment key must map to a non-empty string naming an npm script.\n` +
        `Example: "my-snapshot.json": "generate-snapshot"`,
      );
    }

    expect(valid).toBe(true);
  });

  it('is valid JSON (parseable without error)', () => {
    expect(() => JSON.parse(readFileSync(registryPath, 'utf-8'))).not.toThrow();
  });

  it('is an object at the top level', () => {
    expect(typeof registry).toBe('object');
    expect(registry).not.toBeNull();
    expect(Array.isArray(registry)).toBe(false);
  });
});
