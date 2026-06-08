/**
 * Tests for scripts/check-snapshot-coverage.ts
 *
 * Each test builds a synthetic fixture set (temp dir with golden files,
 * registry JSON, and package.json) and calls runCoverageCheck() directly
 * to verify every failure mode is caught correctly.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import { runCoverageCheck } from '../scripts/check-snapshot-coverage.js';

// ─── Fixture helpers ──────────────────────────────────────────────────────────

function makeFixture(opts: {
  goldenFiles: string[];
  registry: Record<string, unknown>;
  npmScripts: Record<string, string>;
}): { root: string; goldenDir: string; registryPath: string; packageJsonPath: string } {
  const root = mkdtempSync(join(tmpdir(), 'fotn-coverage-test-'));

  const goldenDir = join(root, 'golden');
  mkdirSync(goldenDir, { recursive: true });

  for (const name of opts.goldenFiles) {
    const filePath = join(goldenDir, name);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, '{}');
  }

  const registryPath = join(root, 'registry.json');
  const registryWithComment: Record<string, unknown> = {
    _comment: 'test registry',
    ...opts.registry,
  };
  writeFileSync(registryPath, JSON.stringify(registryWithComment));

  const packageJsonPath = join(root, 'package.json');
  writeFileSync(
    packageJsonPath,
    JSON.stringify({ scripts: opts.npmScripts }),
  );

  return { root, goldenDir, registryPath, packageJsonPath };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('check-snapshot-coverage', () => {
  let fixture: ReturnType<typeof makeFixture>;

  afterEach(() => {
    if (fixture?.root) {
      rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('passes when every golden file has a valid registry entry and npm script', () => {
    fixture = makeFixture({
      goldenFiles: ['snapshot.json', 'manifest.json'],
      registry: {
        'snapshot.json': 'generate-snapshot',
        'manifest.json': 'generate-manifest',
      },
      npmScripts: {
        'generate-snapshot': 'node generate-snapshot.js',
        'generate-manifest': 'node generate-manifest.js',
      },
    });

    const result = runCoverageCheck({ ...fixture, silent: true });

    expect(result.failed).toBe(false);
    expect(result.errors).toHaveLength(0);
  });

  it('reports [UNDOCUMENTED] when a golden file has no registry entry', () => {
    fixture = makeFixture({
      goldenFiles: ['snapshot.json', 'orphan.json'],
      registry: {
        'snapshot.json': 'generate-snapshot',
      },
      npmScripts: {
        'generate-snapshot': 'node generate-snapshot.js',
      },
    });

    const result = runCoverageCheck({ ...fixture, silent: true });

    expect(result.failed).toBe(true);
    const undocumented = result.errors.filter((e) => e.includes('[UNDOCUMENTED]'));
    expect(undocumented).toHaveLength(1);
    expect(undocumented[0]).toContain('orphan.json');
  });

  it('reports [MISSING SCRIPT] when the registry entry names a nonexistent npm script', () => {
    fixture = makeFixture({
      goldenFiles: ['snapshot.json'],
      registry: {
        'snapshot.json': 'generate-snapshot',
      },
      npmScripts: {
        // "generate-snapshot" is intentionally absent
        'some-other-script': 'echo ok',
      },
    });

    const result = runCoverageCheck({ ...fixture, silent: true });

    expect(result.failed).toBe(true);
    const missing = result.errors.filter((e) => e.includes('[MISSING SCRIPT]'));
    expect(missing).toHaveLength(1);
    expect(missing[0]).toContain('snapshot.json');
    expect(missing[0]).toContain('generate-snapshot');
  });

  it('reports [STALE ENTRY] when a registry entry has no matching golden file', () => {
    fixture = makeFixture({
      goldenFiles: ['snapshot.json'],
      registry: {
        'snapshot.json': 'generate-snapshot',
        'deleted-snapshot.json': 'generate-deleted',
      },
      npmScripts: {
        'generate-snapshot': 'node generate-snapshot.js',
        'generate-deleted': 'node generate-deleted.js',
      },
    });

    const result = runCoverageCheck({ ...fixture, silent: true });

    expect(result.failed).toBe(true);
    const stale = result.errors.filter((e) => e.includes('[STALE ENTRY]'));
    expect(stale).toHaveLength(1);
    expect(stale[0]).toContain('deleted-snapshot.json');
  });

  it('reports multiple errors independently in a single run', () => {
    fixture = makeFixture({
      goldenFiles: ['orphan.json'],
      registry: {
        'stale.json': 'generate-stale',
        'missing-script.json': 'generate-nonexistent',
      },
      npmScripts: {
        'generate-stale': 'node generate-stale.js',
        // "generate-nonexistent" absent
      },
    });

    const result = runCoverageCheck({ ...fixture, silent: true });

    expect(result.failed).toBe(true);
    const tags = result.errors.map((e) =>
      e.match(/\[(UNDOCUMENTED|MISSING SCRIPT|STALE ENTRY)\]/)?.[1],
    );
    expect(tags).toContain('UNDOCUMENTED');
    expect(tags).toContain('STALE ENTRY');
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });

  it('--warn-only: exits 0 (failed=false) but still populates errors for stale entries', () => {
    fixture = makeFixture({
      goldenFiles: ['snapshot.json'],
      registry: {
        'snapshot.json': 'generate-snapshot',
        'deleted-snapshot.json': 'generate-deleted',
      },
      npmScripts: {
        'generate-snapshot': 'node generate-snapshot.js',
        'generate-deleted': 'node generate-deleted.js',
      },
    });

    const result = runCoverageCheck({ ...fixture, silent: true, warnOnly: true });

    expect(result.failed).toBe(false);
    const stale = result.errors.filter((e) => e.includes('[STALE ENTRY]'));
    expect(stale).toHaveLength(1);
    expect(stale[0]).toContain('deleted-snapshot.json');
  });

  it('--warn-only: exits 0 (failed=false) and still populates errors for undocumented files', () => {
    fixture = makeFixture({
      goldenFiles: ['snapshot.json', 'orphan.json'],
      registry: {
        'snapshot.json': 'generate-snapshot',
      },
      npmScripts: {
        'generate-snapshot': 'node generate-snapshot.js',
      },
    });

    const result = runCoverageCheck({ ...fixture, silent: true, warnOnly: true });

    expect(result.failed).toBe(false);
    const undocumented = result.errors.filter((e) => e.includes('[UNDOCUMENTED]'));
    expect(undocumented).toHaveLength(1);
    expect(undocumented[0]).toContain('orphan.json');
  });

  it('--warn-only: prints a summary count line matching the number of warnings', () => {
    fixture = makeFixture({
      goldenFiles: ['snapshot.json', 'orphan.json'],
      registry: {
        'snapshot.json': 'generate-snapshot',
        'deleted-snapshot.json': 'generate-deleted',
      },
      npmScripts: {
        'generate-snapshot': 'node generate-snapshot.js',
        'generate-deleted': 'node generate-deleted.js',
      },
    });

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    try {
      const result = runCoverageCheck({ ...fixture, warnOnly: true });

      expect(result.failed).toBe(false);
      expect(result.errors).toHaveLength(2);

      const logged = logSpy.mock.calls.map((args) => args[0] as string);
      const summaryLine = logged.find((line) => line.includes('warning(s) — fix before removing --warn-only'));
      expect(summaryLine).toBeDefined();
      expect(summaryLine).toContain('2 warning(s)');
    } finally {
      logSpy.mockRestore();
    }
  });

  it('--warn-only: summary count reflects the exact number of warnings', () => {
    fixture = makeFixture({
      goldenFiles: ['orphan1.json', 'orphan2.json', 'orphan3.json'],
      registry: {},
      npmScripts: {},
    });

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    try {
      const result = runCoverageCheck({ ...fixture, warnOnly: true });

      expect(result.failed).toBe(false);
      expect(result.errors).toHaveLength(3);

      const logged = logSpy.mock.calls.map((args) => args[0] as string);
      const summaryLine = logged.find((line) => line.includes('warning(s) — fix before removing --warn-only'));
      expect(summaryLine).toBeDefined();
      expect(summaryLine).toContain('3 warning(s)');
    } finally {
      logSpy.mockRestore();
    }
  });

  it('--warn-only: summary count line is NOT printed when there are no warnings', () => {
    fixture = makeFixture({
      goldenFiles: ['snapshot.json'],
      registry: {
        'snapshot.json': 'generate-snapshot',
      },
      npmScripts: {
        'generate-snapshot': 'node generate-snapshot.js',
      },
    });

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    try {
      const result = runCoverageCheck({ ...fixture, warnOnly: true });

      expect(result.failed).toBe(false);
      expect(result.errors).toHaveLength(0);

      const logged = logSpy.mock.calls.map((args) => args[0] as string);
      const summaryLine = logged.find((line) => line.includes('warning(s) — fix before removing --warn-only'));
      expect(summaryLine).toBeUndefined();
    } finally {
      logSpy.mockRestore();
    }
  });

  it('ignores registry keys that start with underscore (comments/metadata)', () => {
    fixture = makeFixture({
      goldenFiles: ['snapshot.json'],
      registry: {
        _comment: 'this should be ignored',
        'snapshot.json': 'generate-snapshot',
      },
      npmScripts: {
        'generate-snapshot': 'node generate-snapshot.js',
      },
    });

    const result = runCoverageCheck({ ...fixture, silent: true });

    expect(result.failed).toBe(false);
    expect(result.errors).toHaveLength(0);
  });

  // ─── Schema validation ──────────────────────────────────────────────────────

  it('reports [INVALID ENTRY] when a registry value is null', () => {
    fixture = makeFixture({
      goldenFiles: ['snapshot.json'],
      registry: { 'snapshot.json': null as unknown as string },
      npmScripts: {},
    });

    const result = runCoverageCheck({ ...fixture, silent: true });

    expect(result.failed).toBe(true);
    const invalid = result.errors.filter((e) => e.includes('[INVALID ENTRY]'));
    expect(invalid).toHaveLength(1);
    expect(invalid[0]).toContain('snapshot.json');
    expect(invalid[0]).toContain('got null');
  });

  it('reports [INVALID ENTRY] when a registry value is an object', () => {
    fixture = makeFixture({
      goldenFiles: ['snapshot.json'],
      registry: { 'snapshot.json': { script: 'generate-snapshot' } as unknown as string },
      npmScripts: {},
    });

    const result = runCoverageCheck({ ...fixture, silent: true });

    expect(result.failed).toBe(true);
    const invalid = result.errors.filter((e) => e.includes('[INVALID ENTRY]'));
    expect(invalid).toHaveLength(1);
    expect(invalid[0]).toContain('snapshot.json');
    expect(invalid[0]).toContain('got object');
  });

  it('reports [INVALID ENTRY] when a registry value is an array', () => {
    fixture = makeFixture({
      goldenFiles: ['snapshot.json'],
      registry: { 'snapshot.json': ['generate-snapshot'] as unknown as string },
      npmScripts: {},
    });

    const result = runCoverageCheck({ ...fixture, silent: true });

    expect(result.failed).toBe(true);
    const invalid = result.errors.filter((e) => e.includes('[INVALID ENTRY]'));
    expect(invalid).toHaveLength(1);
    expect(invalid[0]).toContain('snapshot.json');
    expect(invalid[0]).toContain('got array');
  });

  it('reports [INVALID ENTRY] when a registry value is an empty string', () => {
    fixture = makeFixture({
      goldenFiles: ['snapshot.json'],
      registry: { 'snapshot.json': '' },
      npmScripts: {},
    });

    const result = runCoverageCheck({ ...fixture, silent: true });

    expect(result.failed).toBe(true);
    const invalid = result.errors.filter((e) => e.includes('[INVALID ENTRY]'));
    expect(invalid).toHaveLength(1);
    expect(invalid[0]).toContain('snapshot.json');
  });

  it('reports [INVALID ENTRY] for every bad entry and halts before coverage checks', () => {
    fixture = makeFixture({
      goldenFiles: ['a.json', 'b.json'],
      registry: {
        'a.json': null as unknown as string,
        'b.json': 42 as unknown as string,
      },
      npmScripts: {},
    });

    const result = runCoverageCheck({ ...fixture, silent: true });

    expect(result.failed).toBe(true);
    const invalid = result.errors.filter((e) => e.includes('[INVALID ENTRY]'));
    expect(invalid).toHaveLength(2);
    // No UNDOCUMENTED or STALE errors — schema check exits early
    expect(result.errors.some((e) => e.includes('[UNDOCUMENTED]'))).toBe(false);
    expect(result.errors.some((e) => e.includes('[STALE ENTRY]'))).toBe(false);
  });

  it('underscore keys with non-string values are not flagged as invalid (they are metadata)', () => {
    fixture = makeFixture({
      goldenFiles: ['snapshot.json'],
      registry: {
        _meta: { author: 'test' } as unknown as string,
        'snapshot.json': 'generate-snapshot',
      },
      npmScripts: {
        'generate-snapshot': 'node generate-snapshot.js',
      },
    });

    const result = runCoverageCheck({ ...fixture, silent: true });

    expect(result.failed).toBe(false);
    expect(result.errors).toHaveLength(0);
  });

  // ─── Duplicate script detection ─────────────────────────────────────────────

  it('reports [DUPLICATE SCRIPT] when two registry entries share the same script name', () => {
    fixture = makeFixture({
      goldenFiles: ['a.json', 'b.json'],
      registry: {
        'a.json': 'generate-snapshot',
        'b.json': 'generate-snapshot',
      },
      npmScripts: {
        'generate-snapshot': 'node generate-snapshot.js',
      },
    });

    const result = runCoverageCheck({ ...fixture, silent: true });

    expect(result.failed).toBe(true);
    const duplicates = result.errors.filter((e) => e.includes('[DUPLICATE SCRIPT]'));
    expect(duplicates).toHaveLength(1);
    expect(duplicates[0]).toContain('generate-snapshot');
    expect(duplicates[0]).toContain("'a.json'");
    expect(duplicates[0]).toContain("'b.json'");
  });

  it('reports one [DUPLICATE SCRIPT] entry per duplicated script name, listing all offending files', () => {
    fixture = makeFixture({
      goldenFiles: ['a.json', 'b.json', 'c.json'],
      registry: {
        'a.json': 'generate-shared',
        'b.json': 'generate-shared',
        'c.json': 'generate-shared',
      },
      npmScripts: {
        'generate-shared': 'node generate-shared.js',
      },
    });

    const result = runCoverageCheck({ ...fixture, silent: true });

    expect(result.failed).toBe(true);
    const duplicates = result.errors.filter((e) => e.includes('[DUPLICATE SCRIPT]'));
    expect(duplicates).toHaveLength(1);
    expect(duplicates[0]).toContain('generate-shared');
    expect(duplicates[0]).toContain("'a.json'");
    expect(duplicates[0]).toContain("'b.json'");
    expect(duplicates[0]).toContain("'c.json'");
  });

  it('does not report [DUPLICATE SCRIPT] when all registry entries have distinct script names', () => {
    fixture = makeFixture({
      goldenFiles: ['a.json', 'b.json'],
      registry: {
        'a.json': 'generate-a',
        'b.json': 'generate-b',
      },
      npmScripts: {
        'generate-a': 'node generate-a.js',
        'generate-b': 'node generate-b.js',
      },
    });

    const result = runCoverageCheck({ ...fixture, silent: true });

    expect(result.failed).toBe(false);
    expect(result.errors.filter((e) => e.includes('[DUPLICATE SCRIPT]'))).toHaveLength(0);
  });

  // ─── Subdirectory discovery ──────────────────────────────────────────────────

  it('discovers golden files nested inside subdirectories (recursive walk)', () => {
    fixture = makeFixture({
      goldenFiles: ['top-level.json', 'sub/nested.json'],
      registry: {
        'top-level.json': 'generate-top-level',
        'nested.json': 'generate-nested',
      },
      npmScripts: {
        'generate-top-level': 'node generate-top-level.js',
        'generate-nested': 'node generate-nested.js',
      },
    });

    const result = runCoverageCheck({ ...fixture, silent: true });

    expect(result.failed).toBe(false);
    expect(result.errors).toHaveLength(0);
  });

  it('reports [UNDOCUMENTED] for a file nested inside a subdirectory that has no registry entry', () => {
    fixture = makeFixture({
      goldenFiles: ['snapshot.json', 'sub/orphan.json'],
      registry: {
        'snapshot.json': 'generate-snapshot',
      },
      npmScripts: {
        'generate-snapshot': 'node generate-snapshot.js',
      },
    });

    const result = runCoverageCheck({ ...fixture, silent: true });

    expect(result.failed).toBe(true);
    const undocumented = result.errors.filter((e) => e.includes('[UNDOCUMENTED]'));
    expect(undocumented).toHaveLength(1);
    expect(undocumented[0]).toContain('orphan.json');
  });

  it('discovers golden files nested 3+ levels deep (recursive walk beyond single level)', () => {
    fixture = makeFixture({
      goldenFiles: ['top-level.json', 'a/b/c/deep.json'],
      registry: {
        'top-level.json': 'generate-top-level',
        'deep.json': 'generate-deep',
      },
      npmScripts: {
        'generate-top-level': 'node generate-top-level.js',
        'generate-deep': 'node generate-deep.js',
      },
    });

    const result = runCoverageCheck({ ...fixture, silent: true });

    expect(result.failed).toBe(false);
    expect(result.errors).toHaveLength(0);
  });

  it('reports [UNDOCUMENTED] for a file nested 3+ levels deep with no registry entry', () => {
    fixture = makeFixture({
      goldenFiles: ['snapshot.json', 'a/b/c/deep-orphan.json'],
      registry: {
        'snapshot.json': 'generate-snapshot',
      },
      npmScripts: {
        'generate-snapshot': 'node generate-snapshot.js',
      },
    });

    const result = runCoverageCheck({ ...fixture, silent: true });

    expect(result.failed).toBe(true);
    const undocumented = result.errors.filter((e) => e.includes('[UNDOCUMENTED]'));
    expect(undocumented).toHaveLength(1);
    expect(undocumented[0]).toContain('deep-orphan.json');
  });
});
