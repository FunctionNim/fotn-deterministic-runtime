namespace FOTN.Engine.Memory;

public sealed record ReplayArchiveRecord
(
    string ArchiveId,
    int ReplayFrames,
    bool Stable,
    string ArchiveHash
);
