using FOTN.Runtime.Components;
using Unity.Burst;
using Unity.Entities;

namespace FOTN.Runtime.Systems
{
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(DistrictHeartbeatSystem))]
    public partial struct SeekerHeartbeatSystem : ISystem
    {
        public void OnCreate(ref SystemState state)
        {
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            foreach (var (continuity, resonance, manifestation)
                in SystemAPI.Query<
                    RefRW<SeekerContinuityComponent>,
                    RefRW<ResonanceComponent>,
                    RefRW<FunctionBoxManifestationComponent>>())
            {
                continuity.ValueRW.Pressure += resonance.ValueRO.Distortion * 0.0002f;
                continuity.ValueRW.Pressure -= continuity.ValueRO.Restoration * 0.0003f;

                continuity.ValueRW.Exhaustion += continuity.ValueRO.Pressure * 0.00015f;
                continuity.ValueRW.Exhaustion -= continuity.ValueRO.Restoration * 0.0002f;

                resonance.ValueRW.Stability += continuity.ValueRO.Restoration * 0.0002f;
                resonance.ValueRW.Stability -= continuity.ValueRO.Pressure * 0.0001f;

                resonance.ValueRW.EmotionalIntensity += continuity.ValueRO.Pressure * 0.0001f;

                manifestation.ValueRW.State = continuity.ValueRO.Pressure switch
                {
                    < 0.2f => FunctionBoxManifestationState.Hidden,
                    < 0.4f => FunctionBoxManifestationState.Shimmer,
                    < 0.6f => FunctionBoxManifestationState.Manifesting,
                    < 0.85f => FunctionBoxManifestationState.Active,
                    _ => FunctionBoxManifestationState.Dissolving,
                };

                manifestation.ValueRW.ManifestationProgress = continuity.ValueRO.Pressure;
            }
        }

        public void OnDestroy(ref SystemState state)
        {
        }
    }
}
