// =====================================================
// CANONICAL SERIALIZER V1
// FUNCTIONS OF THE NOTHING
// =====================================================

import {
  RuntimeState,
  CanonicalEntity,
  CombatInstance
} from "../contracts/runtime-contracts.js"

// =====================================================
// CANONICAL SERIALIZER
// =====================================================

export class CanonicalSerializer {

  public static serialize(
    runtimeState: RuntimeState
  ): string {

    const normalizedRuntime =
      this.normalizeRuntimeState(
        runtimeState
      )

    const orderedEntities =
      this.normalizeEntities(
        runtimeState.entities
      )

    const normalizedCombat =
      this.normalizeCombatInstances(
        runtimeState.combatInstances
      )

    const canonicalStructure = {
      runtime: normalizedRuntime,
      entities: orderedEntities,
      combat: normalizedCombat
    }

    return this.canonicalStringify(
      canonicalStructure
    )
  }

  // ===================================================
  // NORMALIZE RUNTIME STATE
  // ===================================================

  private static normalizeRuntimeState(
    runtimeState: RuntimeState
  ) {

    return {
      runtime_tick:
        runtimeState.runtimeTick,

      sequence_number:
        runtimeState.sequenceNumber,

      active_phase:
        runtimeState.activePhase,

      active_player_id:
        runtimeState.activePlayerId,

      priority_player_id:
        runtimeState.priorityPlayerId,

      stack_depth:
        runtimeState.stackDepth
    }
  }

  // ===================================================
  // NORMALIZE ENTITIES
  // ===================================================

  private static normalizeEntities(
    entities:
      readonly CanonicalEntity[]
  ) {

    return [...entities]
      .sort((a, b) =>
        a.entityId.localeCompare(
          b.entityId
        )
      )
      .map(entity => ({
        entity_id:
          entity.entityId,

        owner_id:
          entity.ownerId,

        zone:
          entity.zone
      }))
  }

  // ===================================================
  // NORMALIZE COMBAT INSTANCES
  // ===================================================

  private static normalizeCombatInstances(
    combatInstances:
      readonly CombatInstance[]
  ) {

    return [...combatInstances]
      .sort((a, b) =>
        a.combatId.localeCompare(
          b.combatId
        )
      )
      .map(combat => ({
        combat_id:
          combat.combatId,

        attackers:
          [...combat.attackerIds],

        blockers:
          [...combat.blockerIds],

        target_id:
          combat.targetId,

        combat_resolved:
          combat.combatResolved ? 1 : 0,

        judgment_committed:
          combat.judgmentCommitted ? 1 : 0
      }))
  }

  // ===================================================
  // CANONICAL STRINGIFY
  // ===================================================

  private static canonicalStringify(
    value: unknown
  ): string {

    if (value === null) {
      return `"NULL"`
    }

    if (typeof value === "boolean") {
      return value ? "1" : "0"
    }

    if (typeof value === "number") {
      return `${value}`
    }

    if (typeof value === "string") {
      return JSON.stringify(value)
    }

    if (Array.isArray(value)) {
      return `[${value
        .map(v =>
          this.canonicalStringify(v)
        )
        .join(",")}]`
    }

    if (typeof value === "object") {

      const orderedKeys =
        Object.keys(value as object)
          .sort()

      return `{${orderedKeys
        .map(key => {

          const serializedValue =
            this.canonicalStringify(
              (value as Record<
                string,
                unknown
              >)[key]
            )

          return `${JSON.stringify(key)}:${serializedValue}`
        })
        .join(",")}}`
    }

    throw new Error(
      "Unsupported canonical type."
    )
  }
}