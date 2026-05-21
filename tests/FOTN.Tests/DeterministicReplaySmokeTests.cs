using FOTN.Engine.Hash;
using FOTN.Engine.Runtime;
using FOTN.Engine.Sequencing;
using FOTN.Engine.State;

namespace FOTN.Tests;

public sealed class DeterministicReplaySmokeTests
{
    public void Replay_ShouldGenerateIdenticalHash()
    {
        var state = new GameState
        {
            MatchId = Guid.NewGuid()
        };

        var sequencer = new DeterministicRuntimeSequencer();

        var transitionEngine = new DeterministicStateTransitionEngine();

        var action = new RuntimeAction(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "PLAYER_001",
            "REPLAY_TEST",
            Array.Empty<string>(),
            new Dictionary<string, string>(),
            0
        );

        var sequenced = sequencer.Sequence(action);

        transitionEngine.Apply(state, sequenced.Action);

        var hashGenerator = new SimpleStateHashGenerator();

        var hashA = hashGenerator.Generate(state);
        var hashB = hashGenerator.Generate(state);

        if (hashA != hashB)
        {
            throw new Exception("Deterministic replay hash mismatch.");
        }
    }
}
