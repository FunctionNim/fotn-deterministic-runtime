using FOTN.Engine.Agents;
using FOTN.Engine.Combat;
using FOTN.Engine.Functions;

namespace FOTN.Prototype;

public sealed class ConsoleMatchSimulation
{
    private readonly FunctionApplicationService _functions = new();
    private readonly CombatMutationService _combat = new();

    public void Run()
    {
        var playerOneAgent = new AgentEntity
        {
            AgentId = "A1",
            OwnerId = "P1",
            DisplayName = "Red Vanguard",
            Attack = 1,
            Barrier = 2
        };

        var playerTwoAgent = new AgentEntity
        {
            AgentId = "A2",
            OwnerId = "P2",
            DisplayName = "Stone Guard",
            Attack = 1,
            Barrier = 4
        };

        _functions.ApplyFunction(playerOneAgent, "Red");
        _functions.ApplyFunction(playerTwoAgent, "Stone");

        _combat.ApplyDamage(playerTwoAgent, playerOneAgent.Attack);
        _combat.ApplyDamage(playerOneAgent, playerTwoAgent.Attack);
    }
}
