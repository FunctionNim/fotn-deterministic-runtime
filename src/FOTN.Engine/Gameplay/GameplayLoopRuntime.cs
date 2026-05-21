namespace FOTN.Engine.Gameplay;

public sealed class GameplayLoopRuntime
{
    public TurnStep CurrentStep { get; private set; } = TurnStep.StartOfTurn;

    public MomentumState CurrentMomentum { get; private set; } =
        new(
            Momentum: 0,
            Treasure: 0
        );

    public void AdvanceStep()
    {
        CurrentStep = CurrentStep switch
        {
            TurnStep.StartOfTurn => TurnStep.Upkeep,
            TurnStep.Upkeep => TurnStep.Main,
            TurnStep.Main => TurnStep.Journey,
            TurnStep.Journey => TurnStep.Alchemist,
            TurnStep.Alchemist => TurnStep.Battle,
            TurnStep.Battle => TurnStep.Damage,
            TurnStep.Damage => TurnStep.EndOfTurn,
            _ => TurnStep.StartOfTurn
        };
    }

    public void AwardTreasure(int amount)
    {
        CurrentMomentum = CurrentMomentum with
        {
            Treasure = CurrentMomentum.Treasure + amount
        };
    }

    public void ConvertTreasureToMomentum()
    {
        CurrentMomentum = CurrentMomentum with
        {
            Momentum = CurrentMomentum.Momentum + CurrentMomentum.Treasure,
            Treasure = 0
        };
    }
}
