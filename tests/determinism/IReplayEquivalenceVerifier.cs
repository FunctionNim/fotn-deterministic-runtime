using FOTN.Engine.State;

namespace FOTN.Tests.Determinism;

public interface IReplayEquivalenceVerifier
{
    bool Verify(
        GameState expected,
        GameState reconstructed
    );
}
