namespace FOTN.Continuity.Trials;

/// <summary>
/// Produces reusable Trial fragments from processed continuity experiences.
/// </summary>
public sealed class TrialFragmentGenerationService
{
    public TrialFragmentRecord CreateFragment(
        Guid fragmentId,
        Guid sourceExperienceId,
        string gateKey,
        string pressureType,
        string fragmentSummary,
        bool supportsTraining,
        bool supportsVerdicts,
        DateTimeOffset extractedAt)
    {
        return new TrialFragmentRecord(
            fragmentId,
            sourceExperienceId,
            gateKey,
            pressureType,
            fragmentSummary,
            supportsTraining,
            supportsVerdicts,
            extractedAt
        );
    }
}
