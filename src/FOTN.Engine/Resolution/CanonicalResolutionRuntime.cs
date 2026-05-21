namespace FOTN.Engine.Resolution;

public sealed class CanonicalResolutionRuntime
{
    public IReadOnlyList<BattleDeclaration> OrderBattles(
        IEnumerable<BattleDeclaration> battles
    )
    {
        return battles
            .OrderBy(x => x.Tick)
            .ThenBy(x => x.Sequence)
            .ToList();
    }

    public TreasureSettlementResult ResolveTreasure(
        string playerId,
        int treasure,
        int currentMomentum
    )
    {
        var momentum = currentMomentum + treasure;

        return new TreasureSettlementResult(
            playerId,
            treasure,
            momentum,
            momentum >= 30
        );
    }
}
