using FOTN.Engine.Actions;
using FOTN.Engine.Agents;
using FOTN.Engine.Audit;
using FOTN.Engine.Combat;
using FOTN.Engine.State;

namespace FOTN.Engine.Battle;

public sealed class RuntimeBattleOrchestrator
{
    private readonly BattleResolutionPipeline _pipeline = new();
    private readonly AutomaticAuditInserter _audit = new();

    public BattleContext ExecuteBattle(
        GameState state,
        AgentEntity attacker,
        AgentEntity defender)
    {
        var battle = new BattleContext
        {
            BattleId = Guid.NewGuid(),
            TurnNumber = state.TurnNumber,
            Tick = state.DeterministicTick
        };

        battle.Attackers.Add(attacker.AgentId);
        battle.Blockers.Add(defender.AgentId);

        var attackerIntent = new DamageIntent
        {
            DamageIntentId = Guid.NewGuid(),
            Tick = state.DeterministicTick,
            SourceId = attacker.AgentId,
            AttackerId = attacker.AgentId,
            TargetId = defender.AgentId,
            DamageAmount = attacker.Attack,
            IntentType = DamageIntentType.Targeted
        };

        var defenderIntent = new DamageIntent
        {
            DamageIntentId = Guid.NewGuid(),
            Tick = state.DeterministicTick,
            SourceId = defender.AgentId,
            AttackerId = defender.AgentId,
            TargetId = attacker.AgentId,
            DamageAmount = defender.Attack,
            IntentType = DamageIntentType.Targeted
        };

        battle.DamageIntents.Add(attackerIntent);
        battle.DamageIntents.Add(defenderIntent);

        _pipeline.Execute(state, battle);

        var intent = new ActionIntent
        {
            IntentId = Guid.NewGuid(),
            Tick = state.DeterministicTick,
            ActorId = attacker.OwnerId,
            ActionType = "Battle",
            SourceId = attacker.AgentId,
            TargetIds = new List<string> { defender.AgentId },
            Locked = true,
            Resolved = true
        };

        _audit.Insert(
            state,
            intent,
            state.StateHash,
            state.StateHash,
            "Battle resolved deterministically.");

        return battle;
    }
}
