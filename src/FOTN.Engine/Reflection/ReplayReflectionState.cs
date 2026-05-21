namespace FOTN.Engine.Reflection;

public sealed record ReplayReflectionState
(
    long Tick,
    int ReplayFramesObserved,
    bool ReflectionActive,
    string ReflectionHash
);
