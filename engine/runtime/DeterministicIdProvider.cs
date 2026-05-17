namespace FOTN.Engine.Runtime;

public sealed class DeterministicIdProvider
{
    private long _currentId;

    public string Next(string prefix)
    {
        _currentId++;

        return $"{prefix}_{_currentId:D8}";
    }

    public void Reset()
    {
        _currentId = 0;
    }

    public long Current => _currentId;
}
