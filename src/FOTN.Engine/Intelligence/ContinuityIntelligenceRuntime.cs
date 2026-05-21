namespace FOTN.Engine.Intelligence;

public sealed class ContinuityIntelligenceRuntime
{
    public ContinuityResponse CreateResponse(
        string sourceId,
        string type,
        int weight
    )
    {
        return new ContinuityResponse(
            Guid.NewGuid().ToString(),
            sourceId,
            type,
            weight,
            $"RESP::{sourceId}::{weight}"
        );
    }

    public DistrictResponseState BuildDistrict(
        string districtId,
        int level
    )
    {
        return new DistrictResponseState(
            districtId,
            level,
            level < 10,
            $"DISTRICT::{districtId}::{level}"
        );
    }
}
