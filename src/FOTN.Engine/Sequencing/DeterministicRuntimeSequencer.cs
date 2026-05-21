using FOTN.Engine.Runtime;

namespace FOTN.Engine.Sequencing;

public sealed class DeterministicRuntimeSequencer : IRuntimeSequencer
{
    private long _sequence;

    public SequencedRuntimeAction Sequence(RuntimeAction action)
    {
        _sequence++;

        return new SequencedRuntimeAction(
            Tick: action.Tick,
            Sequence: _sequence,
            Action: action
        );
    }
}
