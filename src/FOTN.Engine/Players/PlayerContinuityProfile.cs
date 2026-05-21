using FOTN.Engine.Functions;

namespace FOTN.Engine.Players;

public sealed record PlayerContinuityProfile
(
    string PlayerId,
    string DisplayName,
    FunctionId PrimaryFunction,
    int ContinuityScore,
    bool Connected
);
