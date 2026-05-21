using FOTN.Engine.Functions;

namespace FOTN.Tests;

public sealed class FunctionPressurePropagationTests
{
    public void PressurePropagation_ShouldReturnCollision()
    {
        var service = new FunctionPressurePropagationService();

        var collision = service.Propagate(
            FunctionId.Red,
            FunctionId.Blue,
            5
        );

        if (collision.PressureValue != 5)
        {
            throw new Exception("Function pressure propagation failed.");
        }
    }
}
