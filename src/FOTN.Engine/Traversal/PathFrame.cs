namespace FOTN.Engine.Traversal;

public sealed record PathFrame
(
    string PathId,
    string SourceId,
    string TargetId,
    bool Active,
    string FrameHash
);
