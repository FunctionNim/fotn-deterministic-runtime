using FOTN.Runtime.Components;
using Unity.Burst;
using Unity.Entities;

namespace FOTN.Runtime.Systems
{
    [BurstCompile]
    public partial struct MeditationVisualRecoverySystem : ISystem
    {
        public void OnCreate(ref SystemState state)
        {
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            foreach (var visual in SystemAPI.Query<RefRW<PressureVisualComponent>>())
            {
                if (visual.ValueRO.ExhaustionDistortion > 0f)
                {
                    visual.ValueRW.ExhaustionDistortion =
                        math.max(0f, visual.ValueRO.ExhaustionDistortion - 0.01f);
                }

                if (visual.ValueRO.State == PressureVisualState.Restoring)
                {
                    visual.ValueRW.SymbolInstability =
                        math.max(0f, visual.ValueRO.SymbolInstability - 0.005f);
                }
            }
        }

        public void OnDestroy(ref SystemState state)
        {
        }
    }
}
