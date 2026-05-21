namespace FOTN.Engine.Audit;

public sealed record AuditEntry
(
    Guid EventId,
    long Timestamp,
    string Actor,
    string Intent,
    string Outcome,
    int StateVersion
);
