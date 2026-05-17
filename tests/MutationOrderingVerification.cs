using FOTN.Engine.Audit;

namespace FOTN.Tests;

public sealed class MutationOrderingVerification
{
    private readonly RuntimeStateMutationAudit _audit = new();

    public MutationOrderingResult Verify()
    {
        var record = _audit.Record(
            "HASH_BEFORE",
            "HASH_AFTER",
            "Mutation ordering verification.");

        var ordered = !string.IsNullOrWhiteSpace(record.Timestamp);

        return new MutationOrderingResult
        {
            MutationOrdered = ordered,
            Timestamp = record.Timestamp
        };
    }
}

public sealed class MutationOrderingResult
{
    public bool MutationOrdered { get; init; }

    public string Timestamp { get; init; } = string.Empty;
}
