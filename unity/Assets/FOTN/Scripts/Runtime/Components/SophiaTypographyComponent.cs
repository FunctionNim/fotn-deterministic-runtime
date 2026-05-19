using Unity.Entities;

namespace FOTN.Runtime.Components
{
    public struct SophiaTypographyComponent : IComponentData
    {
        public float Visibility;
        public float MeaningWeight;
        public float PressureRelevance;
    }
}
