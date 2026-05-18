namespace FOTN.Continuity.Trials;

/// <summary>
/// A reusable pressure fragment extracted from continuity processing.
/// Trial fragments can be recombined into future Trial environments.
/// </summary>
public sealed record TrialFragmentRecord(
    Guid FragmentId,
    Guid SourceExperienceId,
    string GateKey,
    string PressureType,
    string FragmentSummary,
    bool SupportsTraining,
    bool SupportsVerdicts,
    DateTimeOffset ExtractedAt
);
