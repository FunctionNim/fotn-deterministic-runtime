using FOTN.Runtime.Components;
using Unity.Burst;
using Unity.Entities;

namespace FOTN.Runtime.Systems
{
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct DistrictHeartbeatSystem : ISystem
    {
        public void OnCreate(ref SystemState state)
        {
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            foreach (var (pressure, resonance)
                in SystemAPI.Query<RefRW<DistrictPressureComponent>, RefRW<ResonanceComponent>>())
            {
                pressure.ValueRW.Pressure += 0.001f;
                pressure.ValueRW.Pressure -= pressure.ValueRW.Restoration * 0.0005f;

                resonance.ValueRW.Stability += pressure.ValueRW.Restoration * 0.0005f;
                resonance.ValueRW.Stability -= pressure.ValueRW.Pressure * 0.00025f;

                resonance.ValueRW.Distortion += pressure.ValueRW.Pressure * 0.0002f;
                resonance.ValueRW.Synchronization += pressure.ValueRW.Restoration * 0.00015f;
            }
        }

        public void OnDestroy(ref SystemState state)
        {
        }
    }
}
