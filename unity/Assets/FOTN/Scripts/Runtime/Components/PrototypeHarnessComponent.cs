using Unity.Entities;

namespace FOTN.Runtime.Components
{
    public struct PrototypeHarnessComponent : IComponentData
    {
        public byte Enabled;
        public float SimulatedPressure;
        public float SimulatedStabilization;
        public float SimulatedMentalism;
    }
}
