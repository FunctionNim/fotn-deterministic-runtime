using FOTN.Engine.Runtime;
using FOTN.Engine.State;
using FOTN.Engine.Turns;

namespace FOTN.Prototype;

public sealed class PrototypeMatchRunner
{
    private readonly MatchRuntimeLoop _runtimeLoop = new();
    private readonly StateHashUpdater _hashUpdater = new();
    private readonly TurnManager _turnManager = new();

    public GameState CreateMatch()
    {
        var state = new GameState
        {
            MatchId = Guid.NewGuid()
        };

        state.Players.Add(new PlayerState
        {
            PlayerId = "P1",
            DisplayName = "Player One"
        });

        state.Players.Add(new PlayerState
        {
            PlayerId = "P2",
            DisplayName = "Player Two"
        });

        _hashUpdater.Update(state);

        return state;
    }

    public void RunSingleTurn(GameState state)
    {
        for (var i = 0; i < 5; i++)
        {
            _runtimeLoop.Advance(state);
            _hashUpdater.Update(state);
        }
    }
}
