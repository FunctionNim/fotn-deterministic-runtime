using FOTN.Engine.Actions;
using FOTN.Engine.Runtime;
using FOTN.Engine.State;

namespace FOTN.Engine.Input;

public sealed class PlayerActionSelectionSystem
{
    private readonly DeterministicRuntimeContext _runtime;

    public PlayerActionSelectionSystem()
        : this(new DeterministicRuntimeContext())
    {
    }

    public PlayerActionSelectionSystem(DeterministicRuntimeContext runtime)
    {
        _runtime = runtime;
    }

    public ActionIntent SelectAction(
        PlayerState player,
        string actionType,
        string sourceId,
        IEnumerable<string> targets,
        long tick)
    {
        return new ActionIntent
        {
            IntentId = CreateDeterministicGuid("ACTION"),
            Tick = _runtime.Clock.Advance(),
            ActorId = player.PlayerId,
            ActionType = actionType,
            SourceId = sourceId,
            TargetIds = targets.ToList(),
            Locked = false,
            Resolved = false
        };
    }

    private Guid CreateDeterministicGuid(string prefix)
    {
        var id = _runtime.Ids.Next(prefix).Split('_').Last();

        return Guid.Parse($"00000000-0000-0000-0000-{id.PadLeft(12, '0')}");
    }
}
