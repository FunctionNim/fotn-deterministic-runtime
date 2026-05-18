namespace FOTN.Continuity.Reporting;

/// <summary>
/// Produces structured continuity reports from observation and interpretation systems.
/// </summary>
public sealed class ContinuityReportService
{
    public ContinuityReport CreateReport(
        Guid reportId,
        Guid experienceId,
        string reportType,
        string summary,
        string generatedBy,
        DateTimeOffset generatedAt)
    {
        return new ContinuityReport(
            reportId,
            experienceId,
            reportType,
            summary,
            generatedBy,
            generatedAt
        );
    }
}
