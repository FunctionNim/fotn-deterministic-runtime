export type WorldActorKind = 'DigitalUnit';

export interface WorldActorIdentity {
  readonly entityId: string;
  readonly sourceIdentityId: string;
  readonly kind: WorldActorKind;
}

export interface WorldActorLocationState {
  readonly entityId: string;
  readonly districtId: string;
  readonly revision: number;
}

export interface TeleportDestination {
  readonly districtId: string;
  readonly acceptsWorldActors: boolean;
  readonly backendOnly: boolean;
}

export interface TeleportRequest {
  readonly requestId: string;
  readonly entityId: string;
  readonly expectedOriginDistrictId: string;
  readonly expectedRevision: number;
  readonly destinationDistrictId: string;
  readonly permissionGranted: boolean;
}

export type TeleportOutcome = 'MOVED' | 'REPLAY' | 'REFUSED';

export type TeleportRefusal =
  | 'UNKNOWN_ACTOR'
  | 'REQUEST_ID_CONFLICT'
  | 'STALE_ORIGIN'
  | 'STALE_REVISION'
  | 'PERMISSION_REQUIRED'
  | 'DESTINATION_NOT_ADMITTED'
  | 'BACKEND_ONLY_DESTINATION';

export interface TeleportReceipt {
  readonly requestId: string;
  readonly outcome: TeleportOutcome;
  readonly refusal?: TeleportRefusal;
  readonly identity: WorldActorIdentity;
  readonly before: WorldActorLocationState;
  readonly after: WorldActorLocationState;
}

interface StoredReplay {
  readonly fingerprint: string;
  readonly receipt: TeleportReceipt;
}

export class AuthoritativeWorldActorLocationStore {
  private readonly identities = new Map<string, WorldActorIdentity>();
  private readonly locations = new Map<string, WorldActorLocationState>();

  public register(identity: WorldActorIdentity, initialDistrictId: string): void {
    if (this.identities.has(identity.entityId)) {
      throw new Error(`world actor already registered: ${identity.entityId}`);
    }
    this.identities.set(identity.entityId, identity);
    this.locations.set(identity.entityId, {
      entityId: identity.entityId,
      districtId: initialDistrictId,
      revision: 1,
    });
  }

  public readIdentity(entityId: string): WorldActorIdentity | undefined {
    return this.identities.get(entityId);
  }

  public readLocation(entityId: string): WorldActorLocationState | undefined {
    return this.locations.get(entityId);
  }

  public commitTeleport(
    entityId: string,
    expectedRevision: number,
    destinationDistrictId: string,
  ): WorldActorLocationState | undefined {
    const current = this.locations.get(entityId);
    if (!current || current.revision !== expectedRevision) return undefined;

    const next: WorldActorLocationState = {
      entityId,
      districtId: destinationDistrictId,
      revision: current.revision + 1,
    };
    this.locations.set(entityId, next);
    return next;
  }
}

export class WorldActorTeleportAdapter008 {
  private readonly replays = new Map<string, StoredReplay>();

  public constructor(
    private readonly store: AuthoritativeWorldActorLocationStore,
    private readonly destinations: ReadonlyMap<string, TeleportDestination>,
  ) {}

  public teleport(request: TeleportRequest): TeleportReceipt {
    const identity = this.store.readIdentity(request.entityId);
    const before = this.store.readLocation(request.entityId);

    if (!identity || !before) {
      throw new Error(`unknown world actor: ${request.entityId}`);
    }

    const fingerprint = [
      request.entityId,
      request.expectedOriginDistrictId,
      request.expectedRevision,
      request.destinationDistrictId,
      request.permissionGranted ? '1' : '0',
    ].join('|');

    const prior = this.replays.get(request.requestId);
    if (prior) {
      if (prior.fingerprint === fingerprint) {
        return { ...prior.receipt, outcome: 'REPLAY' };
      }
      return this.refusal(request, identity, before, 'REQUEST_ID_CONFLICT');
    }

    if (before.districtId !== request.expectedOriginDistrictId) {
      return this.rememberRefusal(request, fingerprint, identity, before, 'STALE_ORIGIN');
    }
    if (before.revision !== request.expectedRevision) {
      return this.rememberRefusal(request, fingerprint, identity, before, 'STALE_REVISION');
    }
    if (!request.permissionGranted) {
      return this.rememberRefusal(request, fingerprint, identity, before, 'PERMISSION_REQUIRED');
    }

    const destination = this.destinations.get(request.destinationDistrictId);
    if (!destination || !destination.acceptsWorldActors) {
      return this.rememberRefusal(request, fingerprint, identity, before, 'DESTINATION_NOT_ADMITTED');
    }
    if (destination.backendOnly) {
      return this.rememberRefusal(request, fingerprint, identity, before, 'BACKEND_ONLY_DESTINATION');
    }

    const after = this.store.commitTeleport(
      request.entityId,
      request.expectedRevision,
      request.destinationDistrictId,
    );
    if (!after) {
      return this.rememberRefusal(request, fingerprint, identity, before, 'STALE_REVISION');
    }

    const receipt: TeleportReceipt = {
      requestId: request.requestId,
      outcome: 'MOVED',
      identity,
      before,
      after,
    };
    this.replays.set(request.requestId, { fingerprint, receipt });
    return receipt;
  }

  private rememberRefusal(
    request: TeleportRequest,
    fingerprint: string,
    identity: WorldActorIdentity,
    before: WorldActorLocationState,
    refusal: TeleportRefusal,
  ): TeleportReceipt {
    const receipt = this.refusal(request, identity, before, refusal);
    this.replays.set(request.requestId, { fingerprint, receipt });
    return receipt;
  }

  private refusal(
    request: TeleportRequest,
    identity: WorldActorIdentity,
    before: WorldActorLocationState,
    refusal: TeleportRefusal,
  ): TeleportReceipt {
    return {
      requestId: request.requestId,
      outcome: 'REFUSED',
      refusal,
      identity,
      before,
      after: before,
    };
  }
}

export const ADAPTER008_OLA_ENTITY_ID = 'world-actor:unit:ola';

export function createAdapter008OlaRuntime(): {
  readonly store: AuthoritativeWorldActorLocationStore;
  readonly adapter: WorldActorTeleportAdapter008;
} {
  const store = new AuthoritativeWorldActorLocationStore();

  // Qualification007 recovered "ola" as an actual beta-roster identity.
  // Adapter008 creates a distinct world-actor identity instead of collapsing
  // Unit/player/card identity into one namespace.
  store.register(
    {
      entityId: ADAPTER008_OLA_ENTITY_ID,
      sourceIdentityId: 'ola',
      kind: 'DigitalUnit',
    },
    'district:arrival',
  );

  const destinations = new Map<string, TeleportDestination>([
    ['district:commons', {
      districtId: 'district:commons',
      acceptsWorldActors: true,
      backendOnly: false,
    }],
    ['district:backend', {
      districtId: 'district:backend',
      acceptsWorldActors: true,
      backendOnly: true,
    }],
  ]);

  return {
    store,
    adapter: new WorldActorTeleportAdapter008(store, destinations),
  };
}
