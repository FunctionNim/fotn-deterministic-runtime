using Unity.Entities;

namespace FOTN.Runtime.Components
{
    public struct DistrictPressureComponent : IComponentData
    {
        public float Pressure;
        public float Restoration;
        public float EnvironmentalStability;
    }
}
