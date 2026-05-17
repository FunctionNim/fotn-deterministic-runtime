using FOTN.Engine.Actions;
using FOTN.Engine.State;

namespace FOTN.Engine.Runtime;

public sealed class RuntimeErrorGuardrails
{
    public GuardrailResult ValidateAction(
        GameState state,
        ActionIntent intent)
    {
        if (state == null)
        {
            return GuardrailResult.Fail("GameState cannot be null.");
        }

        if (intent == null)
        {
            return GuardrailResult.Fail("ActionIntent cannot be null.");
        }

        if (string.IsNullOrWhiteSpace(intent.ActorId))
        {
            return GuardrailResult.Fail("ActorId is required.");
        }

        if (intent.TargetIds == null)
        {
            return GuardrailResult.Fail("Target collection cannot be null.");
        }

        return GuardrailResult.Success();
    }

    public GuardrailResult ValidateZoneTransfer(
        IList<string> fromZone,
        IList<string> toZone,
        string entityId)
    {
        if (!fromZone.Contains(entityId))
        {
            return GuardrailResult.Fail("Entity does not exist in source zone.");
        }

        if (toZone.Contains(entityId))
        {
            return GuardrailResult.Fail("Duplicate entity detected in destination zone.");
        }

        return GuardrailResult.Success();
    }
}

public sealed class GuardrailResult
{
    public bool Passed { get; init; }

    public string Error { get; init; } = string.Empty;

    public static GuardrailResult Success()
    {
        return new GuardrailResult
        {
            Passed = true
        };
    }

    public static GuardrailResult Fail(string error)
    {
        return new GuardrailResult
        {
            Passed = false,
            Error = error
        };
    }
}
