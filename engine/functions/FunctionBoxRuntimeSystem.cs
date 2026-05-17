using FOTN.Engine.State;

namespace FOTN.Engine.Functions;

public sealed class FunctionBoxRuntimeSystem
{
    public void AssignFunction(
        PlayerState player,
        string functionName)
    {
        if (player.FunctionBox.Count >= 10)
        {
            return;
        }

        player.FunctionBox.Add(functionName);
    }

    public void ClearFunctions(PlayerState player)
    {
        player.FunctionBox.Clear();
    }
}
