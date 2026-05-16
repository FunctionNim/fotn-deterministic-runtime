// =====================================================
// CANONICAL SERIALIZER V1
// FUNCTIONS OF THE NOTHING
// =====================================================
// =====================================================
// CANONICAL SERIALIZER
// =====================================================
export class CanonicalSerializer {
    static serialize(runtimeState) {
        const normalizedRuntime = this.normalizeRuntimeState(runtimeState);
        const orderedEntities = this.normalizeEntities(runtimeState.entities);
        const normalizedCombat = this.normalizeCombatInstances(runtimeState.combatInstances);
        const canonicalStructure = {
            runtime: normalizedRuntime,
            entities: orderedEntities,
            combat: normalizedCombat
        };
        return this.canonicalStringify(canonicalStructure);
    }
    // ===================================================
    // NORMALIZE RUNTIME STATE
    // ===================================================
    static normalizeRuntimeState(runtimeState) {
        return {
            runtime_tick: runtimeState.runtimeTick,
            sequence_number: runtimeState.sequenceNumber,
            active_phase: runtimeState.activePhase,
            active_player_id: runtimeState.activePlayerId,
            priority_player_id: runtimeState.priorityPlayerId,
            stack_depth: runtimeState.stackDepth
        };
    }
    // ===================================================
    // NORMALIZE ENTITIES
    // ===================================================
    static normalizeEntities(entities) {
        return [...entities]
            .sort((a, b) => a.entityId.localeCompare(b.entityId))
            .map(entity => ({
            entity_id: entity.entityId,
            owner_id: entity.ownerId,
            zone: entity.zone
        }));
    }
    // ===================================================
    // NORMALIZE COMBAT INSTANCES
    // ===================================================
    static normalizeCombatInstances(combatInstances) {
        return [...combatInstances]
            .sort((a, b) => a.combatId.localeCompare(b.combatId))
            .map(combat => ({
            combat_id: combat.combatId,
            attackers: [...combat.attackerIds],
            blockers: [...combat.blockerIds],
            target_id: combat.targetId,
            combat_resolved: combat.combatResolved ? 1 : 0,
            judgment_committed: combat.judgmentCommitted ? 1 : 0
        }));
    }
    // ===================================================
    // CANONICAL STRINGIFY
    // ===================================================
    static canonicalStringify(value) {
        if (value === null) {
            return `"NULL"`;
        }
        if (typeof value === "boolean") {
            return value ? "1" : "0";
        }
        if (typeof value === "number") {
            return `${value}`;
        }
        if (typeof value === "string") {
            return JSON.stringify(value);
        }
        if (Array.isArray(value)) {
            return `[${value
                .map(v => this.canonicalStringify(v))
                .join(",")}]`;
        }
        if (typeof value === "object") {
            const orderedKeys = Object.keys(value)
                .sort();
            return `{${orderedKeys
                .map(key => {
                const serializedValue = this.canonicalStringify(value[key]);
                return `${JSON.stringify(key)}:${serializedValue}`;
            })
                .join(",")}}`;
        }
        throw new Error("Unsupported canonical type.");
    }
}
