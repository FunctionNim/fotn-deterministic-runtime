using FOTN.Engine.Actions;
using FOTN.Engine.State;

namespace FOTN.Engine.Validation;

public sealed class CombatTargetLegalityValidator
{
    public ValidationResult Validate(
        GameState state,
        ActionIntent intent)
    {
        if (!intent.TargetIds.Any())
        {
            return ValidationResult.Fail(
                "Combat action requires at least one target.");
        }

        foreach (var target in intent.TargetIds)
        {
            if (string.IsNullOrWhiteSpace(target))
            {
                return ValidationResult.Fail(
                    "Target identifier cannot be empty.");
            }
        }

        return ValidationResult.Success();
    }
}
