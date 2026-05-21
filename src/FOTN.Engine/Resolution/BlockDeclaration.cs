namespace FOTN.Engine.Resolution;

public sealed record BlockDeclaration
(
    string BlockerId,
    string AttackerId,
    long Tick,
    long Sequence
);
