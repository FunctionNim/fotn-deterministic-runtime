using FOTN.Engine.Agents;

namespace FOTN.Engine.Battle;

public sealed class BlockDeclarationSystem
{
    public void DeclareBlock(
        BattleContext battle,
        AgentEntity blocker)
    {
        if (!battle.Blockers.Contains(blocker.AgentId))
        {
            battle.Blockers.Add(blocker.AgentId);
        }
    }
}
