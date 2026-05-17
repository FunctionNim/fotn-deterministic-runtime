namespace FOTN.Engine.State;

public sealed class EntityMutationService
{
    public void ApplyMomentumChange(
        PlayerState player,
        int amount)
    {
        player.Momentum += amount;

        if (player.Momentum < 0)
        {
            player.Momentum = 0;
        }
    }

    public void MoveEntity(
        IList<string> sourceZone,
        IList<string> destinationZone,
        string entityId)
    {
        if (sourceZone.Contains(entityId))
        {
            sourceZone.Remove(entityId);
        }

        if (!destinationZone.Contains(entityId))
        {
            destinationZone.Add(entityId);
        }
    }
}
