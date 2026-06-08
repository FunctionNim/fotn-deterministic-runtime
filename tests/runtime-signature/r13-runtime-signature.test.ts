/**
 * R13 — Runtime Signature System tests.
 *
 * Proves:
 *   1. Identical structured input creates identical signature
 *   2. Object key order does NOT change any hash
 *   3. Array element order DOES change hashes
 *   4. Changing each input field changes the corresponding hash and combinedHash
 *   5. Signature shape is complete and version-stamped
 */

import { describe, it, expect } from 'vitest';
import {
  stableJsonHash,
  buildRuntimeSignature,
  SIGNATURE_VERSION,
  RuntimeSignatureInput,
} from '../../src/runtime-signature/runtime-signature.js';

// ─── Shared fixture ───────────────────────────────────────────────────────────

function baseInput(): RuntimeSignatureInput {
  return {
    scenarioId: 'test:base-scenario',
    initialState: { phase: 'Dormant', pressure: 1 },
    orderedActions: [
      { label: 'Open', index: 0 },
      { label: 'Close', index: 1 },
    ],
    finalState: { phase: 'Resolved', pressure: 0 },
    auditTrail: ['witness:open', 'witness:close'],
    memoryIds: null,
  };
}

// ─── stableJsonHash ───────────────────────────────────────────────────────────

describe('R13 stableJsonHash', () => {

  it('identical objects with different key order produce the same hash', () => {
    const a = stableJsonHash({ z: 1, a: 2, m: 3 });
    const b = stableJsonHash({ a: 2, m: 3, z: 1 });
    expect(a).toBe(b);
  });

  it('different values produce different hashes', () => {
    const a = stableJsonHash({ phase: 'Resolved' });
    const b = stableJsonHash({ phase: 'Failed' });
    expect(a).not.toBe(b);
  });

  it('array element order matters — swapped elements give different hashes', () => {
    const a = stableJsonHash(['alpha', 'beta', 'gamma']);
    const b = stableJsonHash(['gamma', 'beta', 'alpha']);
    expect(a).not.toBe(b);
  });

  it('nested object keys are normalized — different insertion order gives same hash', () => {
    const a = stableJsonHash({ outer: { z: 9, a: 1 } });
    const b = stableJsonHash({ outer: { a: 1, z: 9 } });
    expect(a).toBe(b);
  });

});

// ─── RuntimeSignature — shape and version ─────────────────────────────────────

describe('R13 RuntimeSignature — shape and version', () => {

  it('signatureVersion is the canonical R13 constant', () => {
    const sig = buildRuntimeSignature(baseInput());
    expect(sig.signatureVersion).toBe(SIGNATURE_VERSION);
    expect(sig.signatureVersion).toBe('r13');
  });

  it('deterministicProof defaults to true when not provided', () => {
    const sig = buildRuntimeSignature(baseInput());
    expect(sig.deterministicProof).toBe(true);
  });

  it('deterministicProof can be explicitly set to false', () => {
    const sig = buildRuntimeSignature({ ...baseInput(), deterministicProof: false });
    expect(sig.deterministicProof).toBe(false);
  });

  it('actionCount matches the length of orderedActions', () => {
    const sig = buildRuntimeSignature(baseInput());
    expect(sig.actionCount).toBe(2);

    const sigLonger = buildRuntimeSignature({
      ...baseInput(),
      orderedActions: [
        { label: 'A', index: 0 },
        { label: 'B', index: 1 },
        { label: 'C', index: 2 },
      ],
    });
    expect(sigLonger.actionCount).toBe(3);
  });

  it('memoryHash is null when memoryIds is null', () => {
    const sig = buildRuntimeSignature({ ...baseInput(), memoryIds: null });
    expect(sig.memoryHash).toBeNull();
  });

  it('memoryHash is a non-null string when memoryIds are provided', () => {
    const sig = buildRuntimeSignature({
      ...baseInput(),
      memoryIds: ['memory:encounter:resolved', 'memory:intent:restore'],
    });
    expect(sig.memoryHash).not.toBeNull();
    expect(typeof sig.memoryHash).toBe('string');
    expect(sig.memoryHash!.length).toBeGreaterThan(0);
  });

});

// ─── RuntimeSignature — hash sensitivity ──────────────────────────────────────

describe('R13 RuntimeSignature — hash sensitivity', () => {

  it('same input produces the same combinedHash on every call', () => {
    const sigA = buildRuntimeSignature(baseInput());
    const sigB = buildRuntimeSignature(baseInput());
    expect(sigA.combinedHash).toBe(sigB.combinedHash);
    expect(sigA).toEqual(sigB);
  });

  it('changing initialState changes initialStateHash and combinedHash', () => {
    const base = buildRuntimeSignature(baseInput());
    const changed = buildRuntimeSignature({
      ...baseInput(),
      initialState: { phase: 'Active', pressure: 0.5 },
    });
    expect(changed.initialStateHash).not.toBe(base.initialStateHash);
    expect(changed.combinedHash).not.toBe(base.combinedHash);
  });

  it('changing finalState changes finalStateHash and combinedHash', () => {
    const base = buildRuntimeSignature(baseInput());
    const changed = buildRuntimeSignature({
      ...baseInput(),
      finalState: { phase: 'Failed', pressure: 1 },
    });
    expect(changed.finalStateHash).not.toBe(base.finalStateHash);
    expect(changed.combinedHash).not.toBe(base.combinedHash);
  });

  it('changing auditTrail changes auditHash and combinedHash', () => {
    const base = buildRuntimeSignature(baseInput());
    const changed = buildRuntimeSignature({
      ...baseInput(),
      auditTrail: ['witness:open', 'witness:close', 'witness:seal'],
    });
    expect(changed.auditHash).not.toBe(base.auditHash);
    expect(changed.combinedHash).not.toBe(base.combinedHash);
  });

  it('changing the action sequence changes inputHash and combinedHash', () => {
    const base = buildRuntimeSignature(baseInput());
    const changed = buildRuntimeSignature({
      ...baseInput(),
      orderedActions: [{ label: 'Destroy', index: 0 }],
    });
    expect(changed.inputHash).not.toBe(base.inputHash);
    expect(changed.combinedHash).not.toBe(base.combinedHash);
  });

  it('changing memoryIds changes memoryHash and combinedHash', () => {
    const withMemory = buildRuntimeSignature({
      ...baseInput(),
      memoryIds: ['memory:alpha'],
    });
    const withDifferentMemory = buildRuntimeSignature({
      ...baseInput(),
      memoryIds: ['memory:beta'],
    });
    expect(withDifferentMemory.memoryHash).not.toBe(withMemory.memoryHash);
    expect(withDifferentMemory.combinedHash).not.toBe(withMemory.combinedHash);
  });

  it('initialState object key order does NOT change initialStateHash', () => {
    const sigA = buildRuntimeSignature({
      ...baseInput(),
      initialState: { phase: 'Dormant', pressure: 1 },
    });
    const sigB = buildRuntimeSignature({
      ...baseInput(),
      initialState: { pressure: 1, phase: 'Dormant' },
    });
    expect(sigA.initialStateHash).toBe(sigB.initialStateHash);
    expect(sigA.combinedHash).toBe(sigB.combinedHash);
  });

  it('auditTrail array order DOES change auditHash', () => {
    const sigA = buildRuntimeSignature({
      ...baseInput(),
      auditTrail: ['witness:open', 'witness:close'],
    });
    const sigB = buildRuntimeSignature({
      ...baseInput(),
      auditTrail: ['witness:close', 'witness:open'],
    });
    expect(sigA.auditHash).not.toBe(sigB.auditHash);
    expect(sigA.combinedHash).not.toBe(sigB.combinedHash);
  });

});
