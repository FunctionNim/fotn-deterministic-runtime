using FOTN.Engine.Agents;
using FOTN.Engine.Runtime;
using FOTN.Engine.State;

namespace FOTN.Prototype;

public sealed class MultiTurnMatchSimulation
{
    private readonly PrototypeMatchRunner _runner = new();
    private readonly RuntimeTurnExecutor _executor = new();
    private readonly AgentSpawnService _spawn = new();
    private readonly RuntimeConsoleRenderer _renderer = new();

    public string Run()
    {
        var state = _runner.CreateMatch();

        var agents = new List<AgentEntity>
        {
            _spawn.Spawn("P1", "Red", "Red Vanguard"),
            _spawn.Spawn("P2", "Stone", "Stone Guard")
        };

        for (var turn = 0; turn < 3; turn++)
        {
            _executor.ExecuteTurn(state);
            _runner.RunSingleTurn(state);
        }

        return _renderer.Render(state, agents);
    }
}
