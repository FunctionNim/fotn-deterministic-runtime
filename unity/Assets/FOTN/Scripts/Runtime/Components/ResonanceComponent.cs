using Unity.Entities;

namespace FOTN.Runtime.Components
{
    public struct ResonanceComponent : IComponentData
    {
        public float Stability;
        public float Synchronization;
        public float Distortion;
        public float EmotionalIntensity;
    }
}
