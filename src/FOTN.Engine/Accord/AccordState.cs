namespace FOTN.Engine.Accord;

public sealed record AccordState
(
    string AccordId,
    int Participants,
    int AcceptedCount,
    bool Reached,
    string AccordHash
);
