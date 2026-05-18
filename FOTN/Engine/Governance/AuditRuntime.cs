namespace FOTN.Engine.Governance;

/// <summary>
/// Append-only audit runtime for consequence attribution.
/// Every action must remain replay traceable.
/// </summary>
public sealed class AuditRuntime
{
    private readonly List<string> _events = new();

    public IReadOnlyList<string> Events => _events;

    public void Record(string auditEvent)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(auditEvent);
        _events.Add(auditEvent);
    }
}
