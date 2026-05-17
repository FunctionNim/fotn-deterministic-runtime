using FOTN.Engine.State;

namespace FOTN.Engine.Routing;

public sealed class PolarityRouter
{
    public void RouteToPolarity(
        PlayerState player,
        string entityId)
    {
        if (!player.PolarityZone.Contains(entityId))
        {
            player.PolarityZone.Add(entityId);
        }
    }
}
