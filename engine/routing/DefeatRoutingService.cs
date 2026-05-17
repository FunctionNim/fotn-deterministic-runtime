using FOTN.Engine.Agents;
using FOTN.Engine.State;

namespace FOTN.Engine.Routing;

public sealed class DefeatRoutingService
{
    private readonly PolarityRouter _polarity = new();

    public void RouteDefeatedAgent(
        PlayerState owner,
        AgentEntity agent)
    {
        if (!agent.Defeated)
        {
            return;
        }

        _polarity.RouteToPolarity(owner, agent.AgentId);

        agent.CurrentZone = "Polarity";
    }
}
