import { describe, expect, it } from 'vitest';

import {
  ADAPTER008_OLA_ENTITY_ID,
  createAdapter008OlaRuntime,
} from '../../src/runtime/world-actor-teleport-adapter-008.js';

describe('SEVEN NIMS WORLD ACTOR TELEPORT ADAPTER008', () => {
  it('binds ola to authoritative state and preserves identity across teleport', () => {
    const { store, adapter } = createAdapter008OlaRuntime();
    const original = store.readLocation(ADAPTER008_OLA_ENTITY_ID);

    expect(original).toEqual({
      entityId: ADAPTER008_OLA_ENTITY_ID,
      districtId: 'district:arrival',
      revision: 1,
    });

    const receipt = adapter.teleport({
      requestId: 'A008-REQ-001',
      entityId: ADAPTER008_OLA_ENTITY_ID,
      expectedOriginDistrictId: 'district:arrival',
      expectedRevision: 1,
      destinationDistrictId: 'district:commons',
      permissionGranted: true,
    });

    expect(receipt.outcome).toBe('MOVED');
    expect(receipt.before).toEqual(original);
    expect(receipt.after).toEqual({
      entityId: ADAPTER008_OLA_ENTITY_ID,
      districtId: 'district:commons',
      revision: 2,
    });
    expect(receipt.identity).toEqual({
      entityId: ADAPTER008_OLA_ENTITY_ID,
      sourceIdentityId: 'ola',
      kind: 'DigitalUnit',
    });
    expect(store.readLocation(ADAPTER008_OLA_ENTITY_ID)).toEqual(receipt.after);
  });

  it('returns stable replay evidence without a second move', () => {
    const { store, adapter } = createAdapter008OlaRuntime();
    const request = {
      requestId: 'A008-REQ-002',
      entityId: ADAPTER008_OLA_ENTITY_ID,
      expectedOriginDistrictId: 'district:arrival',
      expectedRevision: 1,
      destinationDistrictId: 'district:commons',
      permissionGranted: true,
    } as const;

    const first = adapter.teleport(request);
    const replay = adapter.teleport(request);

    expect(first.outcome).toBe('MOVED');
    expect(replay.outcome).toBe('REPLAY');
    expect(replay.before).toEqual(first.before);
    expect(replay.after).toEqual(first.after);
    expect(store.readLocation(ADAPTER008_OLA_ENTITY_ID)?.revision).toBe(2);
  });

  it('refuses conflicting request-id reuse', () => {
    const { adapter } = createAdapter008OlaRuntime();

    adapter.teleport({
      requestId: 'A008-REQ-003',
      entityId: ADAPTER008_OLA_ENTITY_ID,
      expectedOriginDistrictId: 'district:arrival',
      expectedRevision: 1,
      destinationDistrictId: 'district:commons',
      permissionGranted: true,
    });

    const conflict = adapter.teleport({
      requestId: 'A008-REQ-003',
      entityId: ADAPTER008_OLA_ENTITY_ID,
      expectedOriginDistrictId: 'district:commons',
      expectedRevision: 2,
      destinationDistrictId: 'district:arrival',
      permissionGranted: true,
    });

    expect(conflict.outcome).toBe('REFUSED');
    expect(conflict.refusal).toBe('REQUEST_ID_CONFLICT');
  });

  it('refuses stale origin and stale revision', () => {
    const a = createAdapter008OlaRuntime();
    expect(a.adapter.teleport({
      requestId: 'A008-REQ-004A',
      entityId: ADAPTER008_OLA_ENTITY_ID,
      expectedOriginDistrictId: 'district:wrong',
      expectedRevision: 1,
      destinationDistrictId: 'district:commons',
      permissionGranted: true,
    }).refusal).toBe('STALE_ORIGIN');

    const b = createAdapter008OlaRuntime();
    expect(b.adapter.teleport({
      requestId: 'A008-REQ-004B',
      entityId: ADAPTER008_OLA_ENTITY_ID,
      expectedOriginDistrictId: 'district:arrival',
      expectedRevision: 99,
      destinationDistrictId: 'district:commons',
      permissionGranted: true,
    }).refusal).toBe('STALE_REVISION');
  });

  it('refuses missing permission without changing authoritative state', () => {
    const { store, adapter } = createAdapter008OlaRuntime();
    const before = store.readLocation(ADAPTER008_OLA_ENTITY_ID);

    const receipt = adapter.teleport({
      requestId: 'A008-REQ-005',
      entityId: ADAPTER008_OLA_ENTITY_ID,
      expectedOriginDistrictId: 'district:arrival',
      expectedRevision: 1,
      destinationDistrictId: 'district:commons',
      permissionGranted: false,
    });

    expect(receipt.outcome).toBe('REFUSED');
    expect(receipt.refusal).toBe('PERMISSION_REQUIRED');
    expect(store.readLocation(ADAPTER008_OLA_ENTITY_ID)).toEqual(before);
  });

  it('refuses backend-only receiving destination without changing authoritative state', () => {
    const { store, adapter } = createAdapter008OlaRuntime();
    const before = store.readLocation(ADAPTER008_OLA_ENTITY_ID);

    const receipt = adapter.teleport({
      requestId: 'A008-REQ-006',
      entityId: ADAPTER008_OLA_ENTITY_ID,
      expectedOriginDistrictId: 'district:arrival',
      expectedRevision: 1,
      destinationDistrictId: 'district:backend',
      permissionGranted: true,
    });

    expect(receipt.outcome).toBe('REFUSED');
    expect(receipt.refusal).toBe('BACKEND_ONLY_DESTINATION');
    expect(receipt.before).toEqual(before);
    expect(receipt.after).toEqual(before);
    expect(store.readLocation(ADAPTER008_OLA_ENTITY_ID)).toEqual(before);
  });
});
