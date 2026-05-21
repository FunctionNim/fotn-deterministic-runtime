namespace FOTN.Engine.Functions;

public sealed class FunctionPressurePropagationService
{
    public FunctionPressureCollision Propagate(
        FunctionId source,
        FunctionId target,
        int pressure
    )
    {
        var stabilized = source == target;

        return new FunctionPressureCollision(
            source,
            target,
            pressure,
            stabilized
        );
    }
}
