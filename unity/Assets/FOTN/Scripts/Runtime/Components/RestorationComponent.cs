using Unity.Entities;

namespace FOTN.Runtime.Components
{
    public struct RestorationComponent : IComponentData
    {
        public float RecoveryStrength;
        public float SynchronizationCalm;
        public float HealingPropagation;
    }
}
