using FOTN.Engine.Client;

namespace FOTN.Tests;

public sealed class ClientRuntimeIntegrationTests
{
    public void RuntimeHost_ShouldAcceptClientConnection()
    {
        var host = new LocalRuntimeHost();

        var handshake = host.Connect(
            "PLAYER_001",
            1
        );

        if (!handshake.Accepted)
        {
            throw new Exception("Runtime handshake failed.");
        }

        var dashboard = host.BuildDashboard(1);

        if (dashboard.ActivePlayers != 1)
        {
            throw new Exception("Dashboard state failed.");
        }
    }
}
