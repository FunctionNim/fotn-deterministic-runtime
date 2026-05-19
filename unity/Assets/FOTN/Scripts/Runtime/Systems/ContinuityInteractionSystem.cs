using FOTN.Runtime.Components;
using Unity.Burst;
using Unity.Entities;

namespace FOTN.Runtime.Systems
{
    [BurstCompile]
    public partial struct ContinuityInteractionSystem : ISystem
    {
        public void OnCreate(ref SystemState state)
        {
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            foreach (var interaction in SystemAPI.Query<RefRW<ContinuityInteractionComponent>>())
            {
                switch (interaction.ValueRO.State)
                {
                    case ContinuityInteractionState.Observe:
                        interaction.ValueRW.State = ContinuityInteractionState.Approach;
                        break;
                    case ContinuityInteractionState.Commit:
                        interaction.ValueRW.State = ContinuityInteractionState.PressureResponse;
                        break;
                    case ContinuityInteractionState.ExhaustionRecovery:
                        interaction.ValueRW.State = ContinuityInteractionState.Observe;
                        break;
                }
            }
        }

        public void OnDestroy(ref SystemState state)
        {
        }
    }
}
