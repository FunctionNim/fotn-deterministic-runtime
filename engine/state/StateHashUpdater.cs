namespace FOTN.Engine.State;

public sealed class StateHashUpdater
{
    private readonly StateHashService _hashService = new();

    public void Update(GameState state)
    {
        state.StateHash = _hashService.ComputeHash(state);
    }
}
