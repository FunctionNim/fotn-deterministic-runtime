namespace FOTN.Engine.SynthesisGovernance;

public sealed class ContinuitySynthesisGovernanceRuntime
{
    public SynthesisGovernanceState BuildState(
        int archives,
        int heritage,
        int patterns
    )
    {
        return new SynthesisGovernanceState(
            archives,
            heritage,
            patterns,
            archives + heritage >= patterns,
            $"STATE::{archives}::{heritage}::{patterns}"
        );
    }

    public ReplayArchiveLinkState BuildReplay(
        int archives,
        int links
    )
    {
        return new ReplayArchiveLinkState(
            archives,
            links,
            links >= archives,
            $"REPLAY::{archives}::{links}"
        );
    }
}
