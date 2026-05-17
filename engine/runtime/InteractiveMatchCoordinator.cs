using FOTN.Engine.Actions;
using FOTN.Engine.Agents;
using FOTN.Engine.Battle;
using FOTN.Engine.Input;
using FOTN.Engine.Momentum;
using FOTN.Engine.State;

namespace FOTN.Engine.Runtime;

public sealed class InteractiveMatchCoordinator
{
    private readonly PlayerActionSelectionSystem _selection = new();
    private readonly RuntimeBattleOrchestrator _battle = new();
    private readonly CombatMomentumService _momentum = new();
    private readonly DeterministicInputRecorder _inputs = new();

    public void ExecuteCombatInteraction(
        GameState state,
        PlayerState attackerOwner,
        PlayerState defenderOwner,
        AgentEntity attacker,
        AgentEntity defender)
    {
        var intent = _selection.SelectAction(
            attackerOwner,
            "Attack",
            attacker.AgentId,
            new[] { defender.AgentId },
            state.DeterministicTick);

        _inputs.Record(intent);

        _battle.ExecuteBattle(state, attacker, defender);

        _momentum.AwardCombatMomentum(
            attackerOwner,
            attacker,
            defender);
    }
}
