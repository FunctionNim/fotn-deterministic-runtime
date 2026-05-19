using FOTN.Runtime.Components;
using Unity.Burst;
using Unity.Entities;

namespace FOTN.Runtime.Systems
{
    [BurstCompile]
    public partial struct PressureVisualSystem : ISystem
    {
        public void OnCreate(ref SystemState state)
        {
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            foreach (var visual in SystemAPI.Query<RefRW<PressureVisualComponent>>())
            {
                if (visual.ValueRO.PressureIntensity >= 0.85f)
                {
                    visual.ValueRW.State = PressureVisualState.Fractured;
                }
                else if (visual.ValueRO.PressureIntensity >= 0.6f)
                {
                    visual.ValueRW.State = PressureVisualState.Unstable;
                }
                else if (visual.ValueRO.PressureIntensity >= 0.3f)
                {
                    visual.ValueRW.State = PressureVisualState.Rising;
                }
                else
                {
                    visual.ValueRW.State = PressureVisualState.Calm;
                }
            }
        }

        public void OnDestroy(ref SystemState state)
        {
        }
    }
}
