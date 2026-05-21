using FOTN.Engine.State;

namespace FOTN.Engine.Hash;

public interface IStateHashGenerator
{
    string Generate(GameState state);
}
