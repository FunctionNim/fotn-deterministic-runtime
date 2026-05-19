using Unity.Entities;

namespace FOTN.Runtime.Components
{
    public enum MentalismTier : byte
    {
        SurfaceContinuity,
        PatternRecognition,
        ContinuitySensitivity,
        InterpretiveDepth,
        PressureAwareness,
        FullContinuityPerception,
    }

    public struct MentalismComponent : IComponentData
    {
        public MentalismTier Tier;
        public float Clarity;
        public float ExhaustionPenalty;
        public float MeditationAlignment;
    }
}
