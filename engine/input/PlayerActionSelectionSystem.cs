using FOTN.Engine.Actions;
using FOTN.Engine.State;

namespace FOTN.Engine.Input;

public sealed class PlayerActionSelectionSystem
{
    public ActionIntent SelectAction(
        PlayerState player,
        string actionType,
        string sourceId,
        IEnumerable<string> targets,
        long tick)
    {
        return new ActionIntent
        {
            IntentId = Guid.NewGuid(),
            Tick = tick,
            ActorId = player.PlayerId,
            ActionType = actionType,
            SourceId = sourceId,
            TargetIds = targets.ToList(),
            Locked = false,
            Resolved = false
        };
    }
}
