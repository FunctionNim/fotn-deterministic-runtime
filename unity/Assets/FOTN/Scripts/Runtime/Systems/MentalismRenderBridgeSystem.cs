using FOTN.Runtime.Components;
using Unity.Burst;
using Unity.Entities;

namespace FOTN.Runtime.Systems
{
    [BurstCompile]
    public partial struct MentalismRenderBridgeSystem : ISystem
    {
        public void OnCreate(ref SystemState state)
        {
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            foreach (var mentalism in SystemAPI.Query<RefRO<MentalismComponent>>())
            {
                switch (mentalism.ValueRO.Tier)
                {
                    case MentalismTier.SurfaceContinuity:
                        break;
                    case MentalismTier.PatternRecognition:
                        break;
                    case MentalismTier.ContinuitySensitivity:
                        break;
                    case MentalismTier.InterpretiveDepth:
                        break;
                    case MentalismTier.PressureAwareness:
                        break;
                    case MentalismTier.FullContinuityPerception:
                        break;
                }
            }
        }

        public void OnDestroy(ref SystemState state)
        {
        }
    }
}
