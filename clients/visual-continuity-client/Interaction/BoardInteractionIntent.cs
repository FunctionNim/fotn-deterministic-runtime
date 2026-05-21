namespace VisualContinuityClient.Interaction;

public sealed record BoardInteractionIntent
(
    string PlayerId,
    string ZoneId,
    string InteractionType,
    long Tick
);
