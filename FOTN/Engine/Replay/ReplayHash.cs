using System.Security.Cryptography;
using System.Text;

namespace FOTN.Engine.Replay;

/// <summary>
/// Produces deterministic replay hashes for runtime equivalence verification.
/// </summary>
public static class ReplayHash
{
    public static string Compute(string input)
    {
        ArgumentNullException.ThrowIfNull(input);

        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes);
    }
}
