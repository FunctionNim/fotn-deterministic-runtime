using Unity.Entities;

namespace FOTN.Runtime.Components
{
    public enum FunctionBoxManifestationState : byte
    {
        Hidden,
        Shimmer,
        Manifesting,
        Active,
        Dissolving,
    }

    public struct FunctionBoxManifestationComponent : IComponentData
    {
        public FunctionBoxManifestationState State;
        public float ManifestationProgress;
    }
}
