using FOTN.Engine.Actions;
using FOTN.Engine.Input;
using FOTN.Engine.State;

namespace FOTN.Prototype;

public sealed class CLIInputRuntime
{
    private readonly PlayerActionSelectionSystem _selection = new();

    public ActionIntent CreateAttackAction(
        PlayerState player,
        string attackerId,
        string targetId,
        long tick)
    {
        return _selection.SelectAction(
            player,
            "Attack",
            attackerId,
            new[] { targetId },
            tick);
    }

    public string RenderPrompt(PlayerState player)
    {
        return $"> {player.DisplayName} select action:";
    }
}
