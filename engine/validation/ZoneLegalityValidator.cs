using FOTN.Engine.State;

namespace FOTN.Engine.Validation;

public sealed class ZoneLegalityValidator
{
    public ValidationResult ValidateTransfer(
        IList<string> sourceZone,
        IList<string> destinationZone,
        string entityId)
    {
        if (!sourceZone.Contains(entityId))
        {
            return ValidationResult.Fail(
                "Entity missing from source zone.");
        }

        if (destinationZone.Contains(entityId))
        {
            return ValidationResult.Fail(
                "Destination zone already contains entity.");
        }

        return ValidationResult.Success();
    }
}
