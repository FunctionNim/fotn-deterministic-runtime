namespace VisualContinuityClient.Presentation;

public sealed record BattlePlaybackFrame
(
    string AttackerId,
    string DefenderId,
    long Tick,
    bool AnimationTriggered,
    string PlaybackHash
);
