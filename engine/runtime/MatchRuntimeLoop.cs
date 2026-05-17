using FOTN.Engine.Reporting;
using FOTN.Engine.State;
using FOTN.Engine.Turns;

namespace FOTN.Engine.Runtime;

public sealed class MatchRuntimeLoop
{
    private readonly TurnManager _turnManager = new();
    private readonly EndStepReportBuilder _reportBuilder = new();

    public IReadOnlyCollection<EndStepReport> Reports => _reports.AsReadOnly();

    private readonly List<EndStepReport> _reports = new();

    public void Advance(GameState state)
    {
        _turnManager.AdvancePhase(state);

        if (state.CurrentPhase == Phase.EndStep)
        {
            var report = _reportBuilder.Build(state);

            _reports.Add(report);
        }
    }
}
