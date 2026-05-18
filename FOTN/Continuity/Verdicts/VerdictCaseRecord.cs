namespace FOTN.Continuity.Verdicts;

/// <summary>
/// A reconstructed continuity contradiction or consequence case extracted
/// from a returned experience for Verdict interpretation.
/// </summary>
public sealed record VerdictCaseRecord(
    Guid VerdictId,
    Guid ExperienceId,
    string VerdictCategory,
    string Prompt,
    string ExpectedResolution,
    bool RequiresDamagePhaseInterpretation,
    bool RequiresRoutingInterpretation,
    bool RequiresSynchronizationInterpretation,
    DateTimeOffset ExtractedAt
);
