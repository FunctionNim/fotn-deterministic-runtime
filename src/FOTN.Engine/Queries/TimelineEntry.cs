namespace FOTN.Engine.Queries;

public sealed record TimelineEntry
(
    long Tick,
    string Type,
    string SourceId,
    string Text,
    string StateHash
);
