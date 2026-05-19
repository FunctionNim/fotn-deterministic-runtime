using FOTN.Runtime.Components;
using Unity.Burst;
using Unity.Entities;

namespace FOTN.Runtime.Systems
{
    [BurstCompile]
    public partial struct MentalismDebugBridgeSystem : ISystem
    {
        public void OnCreate(ref SystemState state)
        {
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            foreach (var mentalism in SystemAPI.Query<RefRW<MentalismComponent>>())
            {
                if (mentalism.ValueRO.Clarity < 0.25f)
                {
                    mentalism.ValueRW.ExhaustionPenalty = 0.75f;
                }
                else if (mentalism.ValueRO.Clarity < 0.5f)
                {
                    mentalism.ValueRW.ExhaustionPenalty = 0.45f;
                }
                else
                {
                    mentalism.ValueRW.ExhaustionPenalty = 0.1f;
                }
            }
        }

        public void OnDestroy(ref SystemState state)
        {
        }
    }
}
