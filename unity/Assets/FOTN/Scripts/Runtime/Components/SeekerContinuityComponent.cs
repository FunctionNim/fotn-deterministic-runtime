using Unity.Entities;

namespace FOTN.Runtime.Components
{
    public struct SeekerContinuityComponent : IComponentData
    {
        public float Pressure;
        public float Exhaustion;
        public float Restoration;
    }
}
