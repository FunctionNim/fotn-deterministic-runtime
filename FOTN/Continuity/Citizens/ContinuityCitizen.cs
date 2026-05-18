namespace FOTN.Continuity.Citizens;

/// <summary>
/// A continuity participant operating inside the Function of Nothing system.
/// Citizens construct, maintain, process, archive, stabilize, observe,
/// and teach playable continuity experiences.
/// </summary>
public sealed record ContinuityCitizen(
    Guid CitizenId,
    string Name,
    CitizenRole Role,
    FunctionAlignment PrimaryAlignment,
    FunctionAlignment? SecondaryAlignment,
    bool IsTrainer,
    bool IsWitness,
    bool CanConstructExperiences,
    bool CanProcessReturnedExperiences,
    bool CanIssueVerdicts,
    bool CanObserveReplayRecords
);
