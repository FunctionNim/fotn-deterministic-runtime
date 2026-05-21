namespace FOTN.Engine.State;

public sealed record ZoneOccupancy
(
    string ZoneId,
    string OwnerId,
    IReadOnlyList<string> EntityIds
);
