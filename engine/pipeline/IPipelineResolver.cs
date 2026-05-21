using FOTN.Engine.Runtime;
using FOTN.Engine.State;

namespace FOTN.Engine.Pipeline;

public interface IPipelineResolver
{
    PipelineResult Resolve(
        GameState state,
        RuntimeAction action
    );
}
