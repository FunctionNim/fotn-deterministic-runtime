using FOTN.Runtime.Components;
using Unity.Burst;
using Unity.Entities;

namespace FOTN.Runtime.Systems
{
    [BurstCompile]
    public partial struct SessionStageSystem : ISystem
    {
        public void OnCreate(ref SystemState state)
        {
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            foreach (var session in SystemAPI.Query<RefRW<SessionStageComponent>>())
            {
                switch (session.ValueRO.Stage)
                {
                    case SessionStage.Arrival:
                        session.ValueRW.Stage = SessionStage.Observation;
                        break;
                    case SessionStage.Participation:
                        session.ValueRW.Stage = SessionStage.PressureEscalation;
                        break;
                    case SessionStage.Resolution:
                        session.ValueRW.Stage = SessionStage.MemoryRecording;
                        break;
                    case SessionStage.MemoryRecording:
                        session.ValueRW.Stage = SessionStage.Departure;
                        break;
                }
            }
        }

        public void OnDestroy(ref SystemState state)
        {
        }
    }
}
