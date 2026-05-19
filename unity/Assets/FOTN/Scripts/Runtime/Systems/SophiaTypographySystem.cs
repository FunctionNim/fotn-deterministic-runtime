using FOTN.Runtime.Components;
using Unity.Burst;
using Unity.Entities;
using Unity.Mathematics;

namespace FOTN.Runtime.Systems
{
    [BurstCompile]
    [UpdateInGroup(typeof(PresentationSystemGroup))]
    [UpdateAfter(typeof(SeekerHeartbeatSystem))]
    public partial struct SophiaTypographySystem : ISystem
    {
        public void OnCreate(ref SystemState state)
        {
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            foreach (var (typography, continuity, manifestation)
                in SystemAPI.Query<
                    RefRW<SophiaTypographyComponent>,
                    RefRO<SeekerContinuityComponent>,
                    RefRO<FunctionBoxManifestationComponent>>())
            {
                var pressure = continuity.ValueRO.Pressure;
                var restoration = continuity.ValueRO.Restoration;

                typography.ValueRW.PressureRelevance = pressure;
                typography.ValueRW.MeaningWeight = math.max(
                    pressure,
                    restoration);

                typography.ValueRW.Visibility = manifestation.ValueRO.State switch
                {
                    FunctionBoxManifestationState.Hidden => 0f,
                    FunctionBoxManifestationState.Shimmer => 0.25f,
                    FunctionBoxManifestationState.Manifesting => 0.6f,
                    FunctionBoxManifestationState.Active => 1f,
                    FunctionBoxManifestationState.Dissolving => 0.35f,
                    _ => 0f,
                };
            }
        }

        public void OnDestroy(ref SystemState state)
        {
        }
    }
}
