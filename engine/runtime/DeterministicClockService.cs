namespace FOTN.Engine.Runtime;

public sealed class DeterministicClockService
{
    private long _tick;

    public long CurrentTick => _tick;

    public long Advance()
    {
        _tick++;

        return _tick;
    }

    public void Reset()
    {
        _tick = 0;
    }

    public string TickLabel()
    {
        return $"TICK_{_tick:D8}";
    }
}
