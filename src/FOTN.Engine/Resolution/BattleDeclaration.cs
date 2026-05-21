namespace FOTN.Engine.Resolution;

public sealed record BattleDeclaration
(
    string AttackerId,
    string TargetId,
    long Tick,
    long Sequence
);
