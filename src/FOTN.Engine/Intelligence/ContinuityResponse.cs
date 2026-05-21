namespace FOTN.Engine.Intelligence;

public sealed record ContinuityResponse
(
    string ResponseId,
    string SourceId,
    string ResponseType,
    int Weight,
    string ResponseHash
);
