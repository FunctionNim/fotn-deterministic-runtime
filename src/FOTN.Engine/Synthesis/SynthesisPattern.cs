namespace FOTN.Engine.Synthesis;

public sealed record SynthesisPattern
(
    string PatternId,
    string SourceId,
    int Strength,
    string PatternHash
);
