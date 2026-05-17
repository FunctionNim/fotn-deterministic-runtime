namespace FOTN.Engine.Routing;

public sealed class ZoneTransferSystem
{
    public void Transfer(
        IList<string> fromZone,
        IList<string> toZone,
        string entityId)
    {
        if (fromZone.Contains(entityId))
        {
            fromZone.Remove(entityId);
        }

        if (!toZone.Contains(entityId))
        {
            toZone.Add(entityId);
        }
    }
}
