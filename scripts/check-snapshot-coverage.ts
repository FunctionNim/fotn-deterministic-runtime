/**
 * check-snapshot-coverage.ts
 *
 * Enforces that every file under tests/golden/ has a corresponding
 * npm run generate-* script documented in scripts/snapshot-registry.json,
 * and that every registry entry maps to a file that actually exists.
 *
 * Registry file format (scripts/snapshot-registry.json):
 *   - Every key whose name starts with "_" (e.g. "_comment") is treated as
 *     metadata and is silently ignored by all checks.
 *   - Every other key must map to a non-empty string value that names the
 *     npm script used to regenerate that golden file.
 *     A value of null, a number, an array, or a nested object is rejected
 *     with a clear [INVALID ENTRY] error before any other check runs.
 *
 * Fails loudly if:
 *   - A registry entry has an invalid (non-string or empty) value.
 *   - A golden file has no registry entry (undocumented snapshot).
 *   - A registry entry names a script that does not exist in package.json.
 *   - A registry entry refers to a golden file that no longer exists
 *     (stale entry — file was deleted or renamed).
 *
 * Flags:
 *   --warn-only   Print violations as warnings and exit 0 instead of
 *                 hard-failing. Useful when phasing in the check on a
 *                 project that already has pre-existing stale entries.
 *                 The default (no flag) is a hard failure (exit 1).
 *
 * Run via: npm run check-snapshot-coverage
 *          npm run check-snapshot-coverage -- --warn-only
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

export interface CoverageCheckOptions {
  goldenDir: string;
  registryPath: string;
  packageJsonPath: string;
  /** When true, suppresses all console output. Useful for tests. */
  silent?: boolean;
  /**
   * When true, violations are printed as warnings and the process exits 0.
   * Use this to phase in the check on a project with pre-existing stale
   * entries without immediately blocking CI.
   */
  warnOnly?: boolean;
}

export interface CoverageCheckResult {
  failed: boolean;
  errors: string[];
}

function collectGoldenFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectGoldenFiles(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

export function runCoverageCheck(opts: CoverageCheckOptions): CoverageCheckResult {
  const { goldenDir, registryPath, packageJsonPath, silent = false, warnOnly = false } = opts;

  const log = silent ? (_: string) => {} : (msg: string) => console.log(msg);

  const rawRegistry = JSON.parse(readFileSync(registryPath, 'utf-8')) as Record<string, unknown>;

  // ── Schema validation: every non-comment key must map to a non-empty string.
  // Run this before any other check so a typo produces a clear message rather
  // than a confusing downstream crash.
  const schemaErrors: string[] = [];
  for (const [key, value] of Object.entries(rawRegistry)) {
    if (key.startsWith('_')) continue; // _comment and similar are metadata — skip
    if (typeof value !== 'string' || value.trim() === '') {
      const got =
        value === null ? 'null'
        : Array.isArray(value) ? 'array'
        : typeof value;
      schemaErrors.push(
        `  ✗ [INVALID ENTRY] registry entry '${key}' must be a string script name, got ${got}\n` +
        `      Each non-comment key must map to a non-empty string naming an npm script.\n` +
        `      Example: "${key}": "generate-snapshot"`,
      );
    }
  }

  if (schemaErrors.length > 0) {
    log('');
    log('═'.repeat(64));
    log('  FOTN — Snapshot Coverage Check');
    log('═'.repeat(64));
    log('');
    for (const err of schemaErrors) {
      log(err);
      log('');
    }
    log('─'.repeat(64));
    log('  Result: ✗ Registry schema validation FAILED — fix the entries above.');
    log('          All values in snapshot-registry.json must be non-empty strings.');
    log('═'.repeat(64));
    log('');
    return { failed: true, errors: schemaErrors };
  }

  const registry: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawRegistry)) {
    if (!key.startsWith('_')) {
      registry[key] = value as string;
    }
  }

  // ── Duplicate-value check: two registry entries sharing the same script name
  // means only one of them can ever be intentionally run — the other is silently
  // masked and will never be regenerated correctly.
  const scriptToKeys = new Map<string, string[]>();
  for (const [key, script] of Object.entries(registry)) {
    const existing = scriptToKeys.get(script) ?? [];
    existing.push(key);
    scriptToKeys.set(script, existing);
  }
  const duplicateErrors: string[] = [];
  for (const [script, keys] of scriptToKeys) {
    if (keys.length > 1) {
      duplicateErrors.push(
        `  ✗ [DUPLICATE SCRIPT] "${script}" is used by multiple registry entries: ${keys.map((k) => `'${k}'`).join(', ')}\n` +
        `      Each golden file must have its own unique generation script.\n` +
        `      Create separate generate-* scripts for each file and update the registry.`,
      );
    }
  }

  if (duplicateErrors.length > 0) {
    log('');
    log('═'.repeat(64));
    log('  FOTN — Snapshot Coverage Check');
    log('═'.repeat(64));
    log('');
    for (const err of duplicateErrors) {
      log(err);
      log('');
    }
    log('─'.repeat(64));
    log('  Result: ✗ Registry validation FAILED — duplicate script names detected.');
    log('          Each golden file must map to its own unique npm script.');
    log('═'.repeat(64));
    log('');
    return { failed: true, errors: duplicateErrors };
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
    scripts: Record<string, string>;
  };
  const npmScripts = packageJson.scripts ?? {};

  const goldenFiles = collectGoldenFiles(goldenDir);
  const goldenFileNames = new Set(goldenFiles.map((f) => basename(f)));

  let failed = false;
  const errors: string[] = [];

  log('');
  log('═'.repeat(64));
  log('  FOTN — Snapshot Coverage Check');
  log('═'.repeat(64));
  log(`\n  Checking ${goldenFiles.length} golden file(s) against snapshot-registry.json\n`);

  const violation = (msg: string) => {
    errors.push(msg);
    if (!warnOnly) {
      failed = true;
    }
  };

  // Forward check: every golden file must have a registry entry + valid script.
  for (const filePath of goldenFiles) {
    const name = basename(filePath);
    const script = registry[name];

    if (script === undefined) {
      violation(
        `  ${warnOnly ? '⚠' : '✗'} [UNDOCUMENTED] ${name}\n` +
        `      No entry in scripts/snapshot-registry.json.\n` +
        `      Add a generate-* script to package.json and register it in the registry.\n` +
        `      Every golden file must have a documented regeneration path.`,
      );
    } else if (npmScripts[script] === undefined) {
      violation(
        `  ${warnOnly ? '⚠' : '✗'} [MISSING SCRIPT] ${name} → npm run ${script}\n` +
        `      Registry points to "npm run ${script}" but that script does not exist in package.json.\n` +
        `      Add the script or update the registry entry.`,
      );
    } else {
      log(`  ✓ ${name.padEnd(36)} → npm run ${script}`);
    }
  }

  // Reverse check: every registry entry must map to a file that actually exists.
  log('');
  log('  Checking registry entries against tests/golden/ (reverse check)\n');
  for (const [name] of Object.entries(registry)) {
    if (!goldenFileNames.has(name)) {
      violation(
        `  ${warnOnly ? '⚠' : '✗'} [STALE ENTRY] registry entry '${name}' has no matching file — was it deleted or renamed?\n` +
        `      Remove or update the entry in scripts/snapshot-registry.json.`,
      );
    } else {
      log(`  ✓ ${name.padEnd(36)} exists in tests/golden/`);
    }
  }

  if (errors.length > 0) {
    log('');
    for (const err of errors) {
      log(err);
      log('');
    }
  }

  log('');
  log('─'.repeat(64));

  if (failed) {
    log('  Result: ✗ Coverage check FAILED — see errors above.');
    log('');
    log('  To fix:');
    log('    1. Add a "generate-<name>" script to package.json that writes the file.');
    log('    2. Add the filename → script mapping to scripts/snapshot-registry.json.');
    log('    3. Remove registry entries for files that no longer exist.');
    log('    4. Re-run: npm run check-snapshot-coverage');
    log('═'.repeat(64));
    log('');
  } else if (errors.length > 0) {
    log('  Result: ⚠ Coverage check passed with warnings (--warn-only).');
    log('          Fix the issues above when ready to enable hard failure.');
    log(`  ⚠ ${errors.length} warning(s) — fix before removing --warn-only`);
    log('═'.repeat(64));
    log('');
  } else {
    log('  Result: ✓ All golden files have documented generation scripts.');
    log('          ✓ All registry entries point to existing golden files.');
    log('═'.repeat(64));
    log('');
  }

  return { failed, errors };
}

// ─── CLI entry point ─────────────────────────────────────────────────────────
// Guard so module-level code does not execute when this file is imported by tests.

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  const __dirname = dirname(__filename);
  const root = join(__dirname, '../..');

  const warnOnly = process.argv.includes('--warn-only');

  const result = runCoverageCheck({
    goldenDir: join(root, 'tests', 'golden'),
    registryPath: join(root, 'scripts', 'snapshot-registry.json'),
    packageJsonPath: join(root, 'package.json'),
    warnOnly,
  });

  if (result.failed) {
    process.exit(1);
  }
}
