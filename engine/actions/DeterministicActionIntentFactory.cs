using FOTN.Engine.Runtime;
using FOTN.Engine.State;

namespace FOTN.Engine.Actions;

public sealed class DeterministicActionIntentFactory
{
    private readonly DeterministicRuntimeContext _runtime;

    public DeterministicActionIntentFactory(
        DeterministicRuntimeContext runtime)
    {
        _runtime = runtime;
    }

    public ActionIntent Create(
        PlayerState player,
        string actionType,
        string sourceId,
        IEnumerable<string> targets)
    {
        return new ActionIntent
        {
            IntentId = Guid.Parse("00000000-0000-0000-0000-" + _runtime.Ids.Next("ACTION").Replace("ACTION_", "")),
            Tick = _runtime.Clock.Advance(),
            ActorId = player.PlayerId,
            ActionType = actionType,
            SourceId = sourceId,
            TargetIds = targets.ToList(),
            Locked = false,
            Resolved = false
        };
    }
}
