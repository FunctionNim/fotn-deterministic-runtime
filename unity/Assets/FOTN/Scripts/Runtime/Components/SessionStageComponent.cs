using Unity.Entities;

namespace FOTN.Runtime.Components
{
    public enum SessionStage : byte
    {
        Arrival,
        Observation,
        Approach,
        Participation,
        PressureEscalation,
        SocialWitnessing,
        Resolution,
        Recovery,
        MemoryRecording,
        Departure,
    }

    public struct SessionStageComponent : IComponentData
    {
        public SessionStage Stage;
        public float Pressure;
        public float Stabilization;
        public float MemoryWeight;
        public byte ContinuesAfterPlayer;
    }
}
