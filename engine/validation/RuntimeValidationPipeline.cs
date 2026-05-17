using FOTN.Engine.Actions;
using FOTN.Engine.State;

namespace FOTN.Engine.Validation;

public sealed class RuntimeValidationPipeline
{
    private readonly LegalActionValidator _legal = new();
    private readonly CombatTargetLegalityValidator _targets = new();

    public ValidationResult Validate(
        GameState state,
        PlayerState player,
        ActionIntent intent)
    {
        var legalResult = _legal.Validate(state, player, intent);

        if (!legalResult.IsValid)
        {
            return legalResult;
        }

        if (intent.ActionType == "Attack")
        {
            var targetResult = _targets.Validate(state, intent);

            if (!targetResult.IsValid)
            {
                return targetResult;
            }
        }

        return ValidationResult.Success();
    }
}
