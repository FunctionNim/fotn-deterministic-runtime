using FOTN.Engine.Agents;
using FOTN.Engine.Battle;

namespace FOTN.Engine.Validation;

public sealed class BlockerLegalityValidator
{
    public ValidationResult Validate(
        BattleContext battle,
        AgentEntity blocker)
    {
        if (blocker.Defeated)
        {
            return ValidationResult.Fail(
                "Defeated Agents cannot block.");
        }

        if (blocker.Exhausted)
        {
            return ValidationResult.Fail(
                "Exhausted Agents cannot block.");
        }

        if (battle.Blockers.Contains(blocker.AgentId))
        {
            return ValidationResult.Fail(
                "Blocker already assigned to battle.");
        }

        return ValidationResult.Success();
    }
}
