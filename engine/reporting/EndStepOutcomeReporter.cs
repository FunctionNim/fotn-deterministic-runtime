using FOTN.Engine.Agents;
using FOTN.Engine.State;

namespace FOTN.Engine.Reporting;

public sealed class EndStepOutcomeReporter
{
    public EndStepOutcomeReport Build(
        GameState state,
        IEnumerable<AgentEntity> agents)
    {
        return new EndStepOutcomeReport
        {
            TurnNumber = state.TurnNumber,
            DefeatedAgents = agents
                .Where(x => x.Defeated)
                .Select(x => x.DisplayName)
                .OrderBy(x => x)
                .ToList(),
            CurrentStateHash = state.StateHash
        };
    }
}

public sealed class EndStepOutcomeReport
{
    public int TurnNumber { get; init; }

    public List<string> DefeatedAgents { get; init; } = new();

    public string CurrentStateHash { get; init; } = string.Empty;
}
