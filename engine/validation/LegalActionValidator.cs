using FOTN.Engine.Actions;
using FOTN.Engine.State;

namespace FOTN.Engine.Validation;

public sealed class LegalActionValidator
{
    public ValidationResult Validate(
        GameState state,
        PlayerState player,
        ActionIntent intent)
    {
        if (intent.ActorId != player.PlayerId)
        {
            return ValidationResult.Fail(
                "Actor does not match player ownership.");
        }

        if (string.IsNullOrWhiteSpace(intent.ActionType))
        {
            return ValidationResult.Fail(
                "Action type is required.");
        }

        if (state.CurrentPhase == Phase.EndStep &&
            intent.ActionType == "Attack")
        {
            return ValidationResult.Fail(
                "Attack actions are not legal during End Step.");
        }

        return ValidationResult.Success();
    }
}

public sealed class ValidationResult
{
    public bool IsValid { get; init; }

    public string Error { get; init; } = string.Empty;

    public static ValidationResult Success()
    {
        return new ValidationResult
        {
            IsValid = true
        };
    }

    public static ValidationResult Fail(string error)
    {
        return new ValidationResult
        {
            IsValid = false,
            Error = error
        };
    }
}
