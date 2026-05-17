using FOTN.Engine.Agents;
using FOTN.Engine.Runtime;
using FOTN.Engine.State;

namespace FOTN.Prototype;

public sealed class LocalPlayableMatchLoop
{
    private readonly PrototypeMatchRunner _runner = new();
    private readonly CLIInputRuntime _cli = new();
    private readonly InteractiveMatchCoordinator _coordinator = new();
    private readonly AgentSpawnService _spawn = new();
    private readonly RuntimeConsoleRenderer _renderer = new();

    public string Run()
    {
        var state = _runner.CreateMatch();

        var playerOne = state.Players.First(x => x.PlayerId == "P1");
        var playerTwo = state.Players.First(x => x.PlayerId == "P2");

        var attacker = _spawn.Spawn("P1", "Red", "Red Vanguard");
        var defender = _spawn.Spawn("P2", "Stone", "Stone Guard");

        var action = _cli.CreateAttackAction(
            playerOne,
            attacker.AgentId,
            defender.AgentId,
            state.DeterministicTick);

        _coordinator.ExecuteCombatInteraction(
            state,
            playerOne,
            playerTwo,
            attacker,
            defender);

        _runner.RunSingleTurn(state);

        return _renderer.Render(state, new[] { attacker, defender });
    }
}
