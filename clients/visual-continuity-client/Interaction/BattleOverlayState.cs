namespace VisualContinuityClient.Interaction;

public sealed record BattleOverlayState
(
    string AttackerId,
    string DefenderId,
    bool Visible,
    string OverlayHash
);
