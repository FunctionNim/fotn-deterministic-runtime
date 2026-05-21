namespace VisualContinuityClient.Presentation;

public sealed record ZoneUpdateFrame
(
    string ZoneId,
    int EntityCount,
    bool Updated,
    string FrameHash
);
