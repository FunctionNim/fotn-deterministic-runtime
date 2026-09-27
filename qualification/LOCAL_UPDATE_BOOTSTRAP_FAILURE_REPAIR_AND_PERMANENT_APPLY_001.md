# LOCAL UPDATE BOOTSTRAP FAILURE REPAIR + PERMANENT APPLY 001

## Status
COMPLETE / REPAIR PASS / PERMANENT v0.1.1 APPLIED.

## Owner-reported failure
The first desktop update attempt failed at:
Move-Item -LiteralPath $InstallRoot -Destination $previous

Observed Windows error:
the current installation directory was in use.

## Root cause
The update launcher and PowerShell updater were both executing from inside:
%LOCALAPPDATA%\FOTN\LocalRuntimeAdapter\current

Windows therefore treated the versioned directory as in use while the updater attempted to rename it to previous.
## Corrective architecture
Stable updater bootstrap moved outside the versioned directory:

%LOCALAPPDATA%\FOTN\LocalRuntimeAdapter\Update FOTN Local Runtime.cmd
%LOCALAPPDATA%\FOTN\LocalRuntimeAdapter\Update-LocalRuntime.ps1

Versioned runtime remains:
%LOCALAPPDATA%\FOTN\LocalRuntimeAdapter\current

Desktop Update shortcut now targets the stable parent-level CMD.

Runtime update ZIPs no longer embed/replace the running updater bootstrap.
## Repair qualification
Repair implementation commit:
e535d45c8b98e87ce576ad425ae1f04462310e99

Repair qualification commit:
34ba73e86d510af76d45a19f07cc55f5dd76799b

Integrated main at repair qualification:
34ba73e86d510af76d45a19f07cc55f5dd76799b

Final repaired v0.1.1 package:
- source commit: 34ba73e86d510af76d45a19f07cc55f5dd76799b
- SHA-256: b150ed67dacf57a3e44a2ee3e53f0d4ff706f5acd9ba21484570a09ea2381f2e
- bytes: 34,274,118
## Superseded release
The earlier v0.1.1 release:
SHA-256 2c08204ce9e7fc4cdd4e9f30a1886bcc5b7e36eedbd03b432e4d22aec99ff9db

is SUPERSEDED and must not be used.

The Downloads copy and hash receipt were replaced with the repaired release.

## Permanent apply result
Permanent runtime:
v0.1.0 → v0.1.1 PASS.

Current:
- version: 0.1.1
- source commit: 34ba73e86d510af76d45a19f07cc55f5dd76799b

Previous retained:
- version: 0.1.0
- source commit: 12d65f444a75cac7d18ce6d4b33e285aa7c724c6
## Post-update independent verification
PASS:
- listener: 127.0.0.1 only
- health identity: LOCAL-RUNTIME-ADAPTER-001
- GP baseline hash: c387fbab785628db092804925fe36f652e8fb2139d3b02de317fe1e3d1d6201f
- GPF-001 through GPF-014: all PASS
- runtime stopped after verification
- desktop Update shortcut points to parent-level bootstrap

## Final disposition
The owner-reported update failure is resolved.

Permanent installed runtime is now v0.1.1.
Previous v0.1.0 remains available for rollback.
Runtime is currently STOPPED.

Future updates must preserve the parent-level bootstrap architecture.
