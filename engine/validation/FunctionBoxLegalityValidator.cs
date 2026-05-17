using FOTN.Engine.State;

namespace FOTN.Engine.Validation;

public sealed class FunctionBoxLegalityValidator
{
    private static readonly HashSet<string> AllowedFunctions = new()
    {
        "Red",
        "Green",
        "Blue",
        "Stone"
    };

    public ValidationResult Validate(
        PlayerState player,
        string functionName)
    {
        if (player.FunctionBox.Count >= 10)
        {
            return ValidationResult.Fail(
                "Function Box limit reached.");
        }

        if (!AllowedFunctions.Contains(functionName))
        {
            return ValidationResult.Fail(
                "Function is not legal for Phase One.");
        }

        return ValidationResult.Success();
    }
}
