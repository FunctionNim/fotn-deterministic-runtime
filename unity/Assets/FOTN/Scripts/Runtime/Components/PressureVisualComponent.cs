using Unity.Entities;

namespace FOTN.Runtime.Components
{
    public enum PressureVisualState : byte
    {
        Calm,
        Rising,
        Unstable,
        Fractured,
        Restoring,
    }

    public struct PressureVisualComponent : IComponentData
    {
        public PressureVisualState State;
        public float PressureIntensity;
        public float SymbolInstability;
        public float RouteInstability;
        public float ExhaustionDistortion;
    }
}
