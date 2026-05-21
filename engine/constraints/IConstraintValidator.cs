namespace FOTN.Engine.Constraints;

using FOTN.Engine.Runtime;
using FOTN.Engine.State;

public interface IConstraintValidator
{
    ValidationResult Validate(
        GameState state,
        RuntimeAction action
    );
}
