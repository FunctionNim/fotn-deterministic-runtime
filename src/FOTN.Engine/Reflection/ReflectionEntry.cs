namespace FOTN.Engine.Reflection;

public sealed record ReflectionEntry
(
    string EntryId,
    long Tick,
    string SourceId,
    string Summary,
    string ReflectionHash
);
