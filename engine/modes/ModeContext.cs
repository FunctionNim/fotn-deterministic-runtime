namespace FOTN.Engine.Modes;

public sealed record ModeContext
(
    string ModeId,
    long Tick,
    int TurnNumber,
    string StateHash
);
