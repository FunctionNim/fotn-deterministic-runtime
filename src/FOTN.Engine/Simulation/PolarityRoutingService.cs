namespace FOTN.Engine.Simulation;

public sealed class PolarityRoutingService
{
    public string Route(bool defeated)
    {
        return defeated
            ? "POLARITY"
            : "ENCOUNTER";
    }
}
