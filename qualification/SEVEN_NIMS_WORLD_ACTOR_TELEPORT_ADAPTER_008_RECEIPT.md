# SEVEN NIMS WORLD ACTOR TELEPORT ADAPTER008 — Qualification Receipt

## Status
SOURCE BINDING PASS / REPLAY + BOUNDARY QUALIFICATION PASS / REPOSITORY INTEGRATION PENDING / DEPLOYMENT NOT PERFORMED

## Qualification identity
- Qualification: SEVEN NIMS WORLD ACTOR TELEPORT ADAPTER008
- Runbook revision: C008-r1
- Repository: FunctionNim/fotn-deterministic-runtime
- Working branch: seven-nims-world-actor-teleport-adapter-008
- Qualified branch head: 31941a84ff74bddc04b277d98a9f59759ba0ba79
- Qualified tree: 6fde68c949cd1b1dd472071d7f72f1cc35dcff01
- Base main: ba06f2560d4df4b5bc593b6697e72667dc8dba4e

## Source ancestry
Qualification007 established documentary source qualification PASS while preserving runtime binding HOLD until one actual digital identity, authoritative location, permissioned destination, request/replay identity, atomic commit, and original before/after receipt were bound.

Adapter008 uses the recovered beta-roster source identity `ola` without claiming that the Unit ID itself was already a located world actor. The runtime creates a separate stable world-actor identity:
- source identity: `ola`
- world actor identity: `world-actor:unit:ola`
- kind: `DigitalUnit`

This preserves the prior identity boundary between source Unit identity, player/card identity, and located world-actor identity.

## Authoritative location binding
Authoritative store:
`AuthoritativeWorldActorLocationStore`

Initial original state:
```json
{
  "entityId": "world-actor:unit:ola",
  "districtId": "district:arrival",
  "revision": 1
}
```

The only Adapter008 movement mutation path is the revision-checked `commitTeleport` operation. Successful movement increments the authoritative location revision exactly once.

## Valid teleport evidence
Request:
- entity: `world-actor:unit:ola`
- expected origin: `district:arrival`
- expected revision: `1`
- destination: `district:commons`
- permission: granted

After state:
```json
{
  "entityId": "world-actor:unit:ola",
  "districtId": "district:commons",
  "revision": 2
}
```

Identity receipt remains:
```json
{
  "entityId": "world-actor:unit:ola",
  "sourceIdentityId": "ola",
  "kind": "DigitalUnit"
}
```

Disposition: PASS — original before state is retained, authoritative after state is explicit, and identity is preserved.

## Replay evidence
Same request ID + identical request fingerprint:
- returns `REPLAY`
- returns the original before/after receipt
- does not invoke a second movement
- authoritative location revision remains `2`

Disposition: PASS.

Conflicting reuse of the same request ID:
- returns `REFUSED`
- refusal: `REQUEST_ID_CONFLICT`

Disposition: PASS.

## Boundary refusal evidence
The test suite verifies:
- stale origin -> `STALE_ORIGIN`
- stale revision -> `STALE_REVISION`
- missing permission -> `PERMISSION_REQUIRED`
- backend-only receiving destination -> `BACKEND_ONLY_DESTINATION`

For refusal cases, `after === before` and the authoritative store remains unchanged.

Disposition: PASS.

## Exact verification evidence
GitHub Actions on exact branch head `31941a84ff74bddc04b277d98a9f59759ba0ba79`:

### Verification Gate — run 37086725522
Conclusion: SUCCESS

TypeScript job `111098467955`:
- Install dependencies: PASS
- Build (tsc): PASS
- Typecheck: PASS
- Test — full registered suite including Adapter008: PASS
- Deterministic demo: PASS
- Golden snapshot guard: PASS

.NET job `111098467811`:
- Restore: PASS
- Build: PASS
- Test: PASS
- Golden snapshot guard: PASS

### deterministic-runtime-ci — run 37086725528
Conclusion: SUCCESS

Validate job `111098468030`:
- Restore: PASS
- Build: PASS
- Test: PASS
- Golden snapshot guard: PASS

## Changed implementation
- `src/runtime/world-actor-teleport-adapter-008.ts`
- `tests/runtime/world-actor-teleport-adapter-008.test.ts`
- `qualification/SEVEN_NIMS_WORLD_ACTOR_TELEPORT_ADAPTER_008_RUNBOOK.md`
- this receipt

Implementation commits before this receipt:
- `29fae0fe6122042460f6888c0f6ecc033e495cdd` — authoritative actor/location binding
- `cb2e383c12458e793c923802c2860bc1267f09bd` — qualification tests
- `31941a84ff74bddc04b277d98a9f59759ba0ba79` — runbook and exact green verification head

## Boundaries
- This proves the repository Adapter008 transaction and its deterministic tests.
- It does not prove a deployed AppDeploy/Windows/live-player teleport.
- No local computer, live server, player save, or production world was mutated.
- No Seven Nim was made into an actor, executor, or authority.
- `ola` remains a source-qualified digital identity; the located actor uses a distinct runtime world-actor ID.
- Repository integration into `main` is a separate step and must preserve the green verification result.

## Qualification disposition
Adapter008’s concrete binding gate is satisfied at the repository-source level:
- actual source-qualified digital identity: BOUND
- stable world-actor identity: BOUND
- authoritative location store: BOUND
- original before state: PROVEN
- after state: PROVEN
- identity preservation: PROVEN
- replay protection: PROVEN
- conflicting replay refusal: PROVEN
- stale-state refusal: PROVEN
- permission refusal: PROVEN
- backend-only boundary refusal: PROVEN
- exact-head CI: PASS
- deployment/live runtime: NOT PERFORMED / NOT CLAIMED

Next lawful integration action: open and verify a pull request into `main`, then merge only if the exact PR head remains green.
