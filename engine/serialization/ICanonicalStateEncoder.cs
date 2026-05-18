using FOTN.Engine.State;

namespace FOTN.Engine.Serialization;

public interface ICanonicalStateEncoder
{
    string Encode(GameState state);
}
