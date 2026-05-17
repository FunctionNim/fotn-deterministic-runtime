using FOTN.Engine.Agents;

namespace FOTN.Engine.Functions;

public sealed class FunctionApplicationService
{
    public void ApplyFunction(
        AgentEntity agent,
        string functionName)
    {
        switch (functionName)
        {
            case "Red":
                agent.Attack += 1;
                break;

            case "Green":
                agent.Barrier += 1;
                break;

            case "Blue":
                agent.Attack += 1;
                agent.Barrier += 1;
                break;

            case "Stone":
                agent.Barrier += 2;
                break;
        }
    }
}
