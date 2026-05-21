namespace FOTN.Engine.Client;

public sealed class LocalRuntimeHost
{
    private readonly List<ClientSession> _sessions = new();

    public IReadOnlyList<ClientSession> Sessions => _sessions;

    public RuntimeHandshake Connect(
        string playerId,
        long tick
    )
    {
        var session = new ClientSession(
            Guid.NewGuid().ToString(),
            playerId,
            true,
            tick
        );

        _sessions.Add(session);

        return new RuntimeHandshake(
            session.SessionId,
            "v0.1",
            true,
            true
        );
    }

    public ContinuityDashboardState BuildDashboard(long tick)
    {
        return new ContinuityDashboardState(
            tick,
            _sessions.Count,
            0,
            0,
            $"DASH::{tick}::{_sessions.Count}"
        );
    }
}
