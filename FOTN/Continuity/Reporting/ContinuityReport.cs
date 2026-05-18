namespace FOTN.Continuity.Reporting;

/// <summary>
/// A structured continuity intelligence report generated from observed and interpreted systems.
/// </summary>
public sealed record ContinuityReport(
    Guid ReportId,
    Guid ExperienceId,
    string ReportType,
    string Summary,
    string GeneratedBy,
    DateTimeOffset GeneratedAt
);
