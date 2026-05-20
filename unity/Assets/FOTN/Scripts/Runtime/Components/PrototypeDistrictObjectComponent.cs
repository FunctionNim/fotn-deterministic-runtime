using Unity.Entities;

namespace FOTN.Runtime.Components
{
    public enum PrototypeDistrictObjectKind : byte
    {
        PlayerSpawn,
        RitualAnchor,
        QuestionStone,
        PressureSource,
        WitnessPosition,
        RecoveryGarden,
        RouteNode,
        ExitBridge,
    }

    public struct PrototypeDistrictObjectComponent : IComponentData
    {
        public PrototypeDistrictObjectKind Kind;
        public float InfluenceRadius;
        public byte IsActive;
    }
}
