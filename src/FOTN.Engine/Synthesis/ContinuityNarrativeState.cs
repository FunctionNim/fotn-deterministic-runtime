namespace FOTN.Engine.Synthesis;

public sealed record ContinuityNarrativeState
(
    int ActivePatterns,
    int ActiveCivilizations,
    bool NarrativeStable,
    string NarrativeHash
);
