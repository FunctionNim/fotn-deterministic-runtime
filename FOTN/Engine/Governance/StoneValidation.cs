namespace FOTN.Engine.Governance;

/// <summary>
/// Enforces immutable Stone-layer runtime laws.
/// Stone does not modify.
/// Stone validates.
/// </summary>
public sealed class StoneValidation
{
    public bool ValidateNumericValue(int value)
    {
        return value >= RuntimeConstraints.MinValue
            && value <= RuntimeConstraints.MathMax;
    }

    public bool ValidateTurnNumber(int turnNumber)
    {
        return turnNumber >= RuntimeConstraints.MinValue
            && turnNumber <= RuntimeConstraints.MaxTurnNumber;
    }
}
