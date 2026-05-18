using FOTN.Engine.Runtime;

namespace FOTN.Engine.Sequencing;

public interface IRuntimeSequencer
{
    SequencedRuntimeAction Sequence(RuntimeAction action);
}
