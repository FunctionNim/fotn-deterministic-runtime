namespace FOTN.Continuity.Gold;

/// <summary>
/// Creates continuity observation summaries for Gold-facing systems.
/// Gold observes and interprets patterns without directly changing outcomes.
/// </summary>
public sealed class GoldObservationService
{
    public string CreateObservationSummary(
        Guid experienceId,
        string observedPattern,
        string confidenceLevel)
    {
        return $"Experience {experienceId}: {observedPattern} [{confidenceLevel}]";
    }
}
