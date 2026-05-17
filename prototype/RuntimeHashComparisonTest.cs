using FOTN.Engine.State;

namespace FOTN.Prototype;

public sealed class RuntimeHashComparisonTest
{
    private readonly PrototypeMatchRunner _runner = new();

    public bool Validate()
    {
        var stateOne = _runner.CreateMatch();
        var stateTwo = _runner.CreateMatch();

        _runner.RunSingleTurn(stateOne);
        _runner.RunSingleTurn(stateTwo);

        return stateOne.StateHash == stateTwo.StateHash;
    }
}
