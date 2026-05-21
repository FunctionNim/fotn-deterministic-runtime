namespace FOTN.Engine.Interface;

public sealed record ZoneViewState
(
    string ZoneId,
    string DisplayName,
    int EntityCount,
    bool Visible
);
