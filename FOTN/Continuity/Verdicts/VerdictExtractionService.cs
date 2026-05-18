namespace FOTN.Continuity.Verdicts;

/// <summary>
/// Produces Verdict interpretation cases from returned continuity experiences.
/// </summary>
public sealed class VerdictExtractionService
{
    public VerdictCaseRecord CreateCase(
        Guid verdictId,
        Guid experienceId,
        string category,
        string prompt,
        string expectedResolution,
        bool requiresDamagePhaseInterpretation,
        bool requiresRoutingInterpretation,
        bool requiresSynchronizationInterpretation,
        DateTimeOffset extractedAt)
    {
        return new VerdictCaseRecord(
            verdictId,
            experienceId,
            category,
            prompt,
            expectedResolution,
            requiresDamagePhaseInterpretation,
            requiresRoutingInterpretation,
            requiresSynchronizationInterpretation,
            extractedAt
        );
    }
}
