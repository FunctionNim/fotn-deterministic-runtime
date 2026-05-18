namespace FOTN.Engine.Governance;

/// <summary>
/// Global deterministic runtime constraints enforced by The Nothing / Stone layer.
/// </summary>
public static class RuntimeConstraints
{
    public const int MinValue = 0;
    public const int MathMax = 20;
    public const int MaxTurnNumber = 13;

    public static int ClampValue(int value)
    {
        return Math.Clamp(value, MinValue, MathMax);
    }

    public static int ClampTurnBonus(int value, int turnNumber)
    {
        var legalTurn = Math.Clamp(turnNumber, MinValue, MaxTurnNumber);
        return Math.Clamp(value, MinValue, legalTurn);
    }
}
