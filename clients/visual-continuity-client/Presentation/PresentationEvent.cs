namespace VisualContinuityClient.Presentation;

public sealed record PresentationEvent
(
    string EventId,
    string EventType,
    long Tick,
    string TargetId,
    string PresentationHash
);
