using FOTN.Engine.Runtime;

namespace FOTN.Engine.Sequencing;

public sealed record SequencedRuntimeAction
(
    long Tick,
    long Sequence,
    RuntimeAction Action
);
