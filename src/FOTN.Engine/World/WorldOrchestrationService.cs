namespace FOTN.Engine.World;

public sealed class WorldOrchestrationService
{
    private readonly List<DistrictState> _districts = new();
    private readonly List<RouteConnection> _routes = new();
    private readonly List<ResonanceNode> _nodes = new();

    public IReadOnlyList<DistrictState> Districts => _districts;
    public IReadOnlyList<RouteConnection> Routes => _routes;
    public IReadOnlyList<ResonanceNode> Nodes => _nodes;

    public void RegisterDistrict(DistrictState district)
    {
        _districts.Add(district);
    }

    public void RegisterRoute(RouteConnection route)
    {
        _routes.Add(route);
    }

    public void RegisterNode(ResonanceNode node)
    {
        _nodes.Add(node);
    }
}
