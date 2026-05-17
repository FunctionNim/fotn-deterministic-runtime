using System.Text;

namespace FOTN.Prototype;

public sealed class ExecutablePrototypeEntryPoint
{
    private readonly LocalPlayableMatchLoop _local = new();
    private readonly FullMatchReplayRunner _replay = new();
    private readonly ReplayPlaybackRunner _playback = new();
    private readonly DeterministicStressRunner _stress = new();

    public string Run()
    {
        var output = _local.Run();

        var replayPayload = _replay.BuildReplay(
            new Engine.State.GameState
            {
                MatchId = Guid.NewGuid()
            });

        var playback = _playback.Playback(replayPayload);

        var stress = _stress.Execute(10);

        var builder = new StringBuilder();

        builder.AppendLine("=== FUNCTIONS OF THE NOTHING ===");
        builder.AppendLine(output);
        builder.AppendLine();
        builder.AppendLine("=== REPLAY PLAYBACK ===");

        foreach (var line in playback)
        {
            builder.AppendLine(line);
        }

        builder.AppendLine();
        builder.AppendLine("=== STRESS TEST ===");
        builder.AppendLine($"Iterations: {stress.Iterations}");
        builder.AppendLine($"Passed: {stress.PassedIterations}");
        builder.AppendLine($"Failed: {stress.FailedIterations}");
        builder.AppendLine($"Stable: {stress.FullyStable}");

        return builder.ToString();
    }
}
