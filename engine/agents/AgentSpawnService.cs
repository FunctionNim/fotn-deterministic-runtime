using FOTN.Engine.Functions;

namespace FOTN.Engine.Agents;

public sealed class AgentSpawnService
{
    private readonly FunctionApplicationService _functions = new();

    public AgentEntity Spawn(
        string ownerId,
        string functionName,
        string displayName)
    {
        var agent = new AgentEntity
        {
            AgentId = Guid.NewGuid().ToString(),
            OwnerId = ownerId,
            DisplayName = displayName,
            Attack = 1,
            Barrier = 1
        };

        _functions.ApplyFunction(agent, functionName);

        return agent;
    }
}
