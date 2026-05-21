namespace FOTN.Engine.RuntimeLoop;

public sealed class DeterministicScheduler
{
    private long _sequence;

    public long NextSequence()
    {
        _sequence++;

        return _sequence;
    }
}
