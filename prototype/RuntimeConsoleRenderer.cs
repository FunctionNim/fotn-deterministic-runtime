using FOTN.Engine.Agents;
using FOTN.Engine.State;

namespace FOTN.Prototype;

public sealed class RuntimeConsoleRenderer
{
    public string Render(
        GameState state,
        IEnumerable<AgentEntity> agents)
    {
        var lines = new List<string>
        {
            $"Turn: {state.TurnNumber}",
            $"Phase: {state.CurrentPhase}",
            $"State Hash: {state.StateHash}"
        };

        foreach (var player in state.Players.OrderBy(x => x.PlayerId))
        {
            lines.Add($"Player {player.DisplayName} | Momentum: {player.Momentum}");
        }

        foreach (var agent in agents.OrderBy(x => x.AgentId))
        {
            lines.Add($"Agent {agent.DisplayName} | ATK {agent.Attack} | BAR {agent.Barrier} | Defeated: {agent.Defeated}");
        }

        return string.Join(Environment.NewLine, lines);
    }
}
