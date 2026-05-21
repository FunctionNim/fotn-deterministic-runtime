namespace FOTN.Engine.Visibility;

public sealed class InformationBoxRuntimeService
{
    private readonly List<HiddenConsequence> _consequences = new();

    public IReadOnlyList<HiddenConsequence> Consequences => _consequences;

    public void Register(HiddenConsequence consequence)
    {
        _consequences.Add(consequence);
    }

    public InformationRevealState Reveal(long tick)
    {
        return new InformationRevealState(
            Tick: tick,
            RevealAuthorized: true,
            VisibleConsequences: _consequences.Count,
            StateHash: $"REVEAL::{tick}::{_consequences.Count}"
        );
    }
}
