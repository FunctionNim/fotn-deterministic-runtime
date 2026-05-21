namespace VisualContinuityClient.World;

public sealed class ContinuityWorldNavigationRuntime
{
    public ContinuityMapViewState BuildMap(
        int districts,
        int paths
    )
    {
        return new ContinuityMapViewState(
            districts,
            paths,
            true,
            $"MAP::{districts}::{paths}"
        );
    }
}
