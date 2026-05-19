using Unity.Entities;

namespace FOTN.Runtime.Components
{
    public enum ContinuityInteractionState : byte
    {
        Observe,
        Approach,
        Commit,
        PressureResponse,
        InterruptionCheck,
        Resolution,
        ExhaustionRecovery,
        MemoryRecording,
        WorldContinues,
    }

    public enum ContinuityInteractionIntent : byte
    {
        Observe,
        Stabilize,
        Gather,
        Restore,
        Debate,
        Craft,
        Meditate,
        Depart,
    }

    public struct ContinuityInteractionComponent : IComponentData
    {
        public ContinuityInteractionState State;
        public ContinuityInteractionIntent Intent;
        public float PressureChange;
        public float BondAssistStrength;
        public byte WithinInteractionRange;
    }
}
