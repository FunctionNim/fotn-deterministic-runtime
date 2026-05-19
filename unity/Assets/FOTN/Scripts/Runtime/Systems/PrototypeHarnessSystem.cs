using FOTN.Runtime.Components;
using Unity.Burst;
using Unity.Entities;

namespace FOTN.Runtime.Systems
{
    [BurstCompile]
    public partial struct PrototypeHarnessSystem : ISystem
    {
        public void OnCreate(ref SystemState state)
        {
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            foreach (var harness in SystemAPI.Query<RefRW<PrototypeHarnessComponent>>())
            {
                if (harness.ValueRO.Enabled == 0)
                {
                    continue;
                }

                harness.ValueRW.SimulatedPressure =
                    math.clamp(harness.ValueRO.SimulatedPressure + 0.0025f, 0f, 1f);

                harness.ValueRW.SimulatedStabilization =
                    math.clamp(harness.ValueRO.SimulatedStabilization + 0.001f, 0f, 1f);
            }
        }

        public void OnDestroy(ref SystemState state)
        {
        }
    }
}
