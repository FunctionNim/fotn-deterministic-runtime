# PERMANENT LOCAL INSTALLATION 001 — RECEIPT

## Status
COMPLETE / OWNER-AUTHORIZED.

## Source lineage
- Repository: FunctionNim/fotn-deterministic-runtime
- Integrated main before installation: 22f3fb2ed51eca13d2dea9e2c032741222df6f58
- Qualified packaging implementation: 12d65f444a75cac7d18ce6d4b33e285aa7c724c6
- Packaging owner-lock commit: 22f3fb2ed51eca13d2dea9e2c032741222df6f58
- Installer version: 0.1.0
- Installer SHA-256: 9ff22a88f7b68c7ac550f88e6772d060ea950bdf5944c43b92aad83719a69e20

## Permanent installation target
- Product: FOTN Local Runtime Adapter
- Device: AaronM
- Install root: C:\Users\dyron\AppData\Local\FOTN\LocalRuntimeAdapter\current
- Desktop shortcut: C:\Users\dyron\OneDrive\Desktop\FOTN Local Runtime.lnk
- Default host: 127.0.0.1
- Default port: 24701
- Startup registration: none
- Windows service: none
- Scheduled task: none
- Firewall rule: none
- Public/LAN listener: none

## Installer verification
Before execution:
- installer SHA-256 matched the qualified artifact;
- no existing install root was present;
- no existing owner-facing shortcut was present.

Installation result:
- installer exit code: 0;
- install marker present;
- manifest present;
- manifest source commit: 12d65f444a75cac7d18ce6d4b33e285aa7c724c6;
- all 14 installed payload file hashes matched the manifest;
- bundled Node version: v24.15.0;
- bundled node.exe hash matched the qualified package.

## Shortcut verification
Shortcut target:
C:\Users\dyron\AppData\Local\FOTN\LocalRuntimeAdapter\current\Start FOTN Local Runtime.cmd

Shortcut working directory:
C:\Users\dyron\AppData\Local\FOTN\LocalRuntimeAdapter\current

Shortcut verification: PASS.

## Live installed runtime verification
Installed launcher start: PASS.

Listener:
- 127.0.0.1:24701 only;
- no wildcard/public bind.

Health identity:
- status: ok;
- adapterId: LOCAL-RUNTIME-ADAPTER-001;
- qualifiedBaseCommit: 9e633eb1459b5cf0a00fcc9d58bdd15f69a27871;
- fixtureId: GP-TEST-001.

GP baseline:
- total Water: 12,000,000 GP-WU;
- baseline hash: c387fbab785628db092804925fe36f652e8fb2139d3b02de317fe1e3d1d6201f.

## Installed canary results
PASS:
- GPF-001
- GPF-002
- GPF-003
- GPF-004
- GPF-005
- GPF-006
- GPF-007
- GPF-008 with expected WATER_SOURCE_UNDERFLOW halt
- GPF-009 with expected WATER_DESTINATION_OVERFLOW halt
- GPF-010 with expected ENERGY_IMBALANCE halt
- GPF-011
- GPF-012
- GPF-013
- GPF-014

All fourteen returned pass=true.

## Stop state
Stop launcher: PASS.

After verification:
- port 24701 closed;
- adapter process stopped;
- installation remains present;
- desktop shortcut remains present.

The permanent installation is intentionally left installed but stopped.

## System mutation witness
Before permanent installation:
- FOTN-named Windows services: 0;
- FOTN-named scheduled tasks: 0;
- FOTN-named firewall rules: 0.

After permanent installation:
- FOTN-named Windows services: 0;
- FOTN-named scheduled tasks: 0;
- FOTN-named firewall rules: 0.

No service/startup/firewall mutation occurred.

## Reinstall artifact
A verified copy of the installer was placed in the owner's Downloads folder:

C:\Users\dyron\Downloads\FOTN-Local-Runtime-Adapter-Setup-v0.1.0.exe

SHA-256:
9ff22a88f7b68c7ac550f88e6772d060ea950bdf5944c43b92aad83719a69e20

Hash receipt:
C:\Users\dyron\Downloads\FOTN-Local-Runtime-Adapter-Setup-v0.1.0.sha256.txt

## Security hold
The installer remains unsigned.
Windows SmartScreen may warn when the installer is launched or transferred.

Still held:
- code signing;
- public distribution;
- automatic update mechanism;
- startup registration;
- Windows service mode;
- LAN/public exposure;
- persistent game sessions.

## Final disposition
PERMANENT LOCAL INSTALLATION 001 — PASS / COMPLETE.

The qualified FOTN Local Runtime Adapter is now installed on the owner's computer with an owner-facing desktop launcher and a reinstallable installer in Downloads.

The runtime is currently STOPPED.

## Next lawful action
LOCAL UPDATE CHANNEL QUALIFICATION 001.

Purpose:
define how future owner-locked runtime releases replace the installed local runtime safely without manual uninstall/reinstall, while preserving rollback, manifest verification, localhost-only behavior, and GP-TEST-001 post-update canary verification.
