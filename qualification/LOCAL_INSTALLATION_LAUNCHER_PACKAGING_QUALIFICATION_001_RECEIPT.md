# LOCAL INSTALLATION + LAUNCHER PACKAGING QUALIFICATION 001 — RECEIPT

## Status
QUALIFICATION PASS / OWNER LOCK PENDING.

No permanent installation, startup registration, Windows service registration, firewall change, public-network exposure, auto-update, or code-signing action is authorized by this receipt.

## Source binding
- Repository: FunctionNim/fotn-deterministic-runtime
- Parent integrated runtime commit: 5405b6ffeb057a3f3ac9105da0e84f72b6501e3b
- Packaging branch: local-install-launcher-packaging-v0-1
- Packaging implementation commit: 12d65f444a75cac7d18ce6d4b33e285aa7c724c6
- Packaging tree: b970b057635f9d0951982dc1e69708b1c669bc9f
- Installer version: 0.1.0

## Final installer identity
- File: FOTN-Local-Runtime-Adapter-Setup-v0.1.0.exe
- Size: 34,041,856 bytes
- SHA-256: 9ff22a88f7b68c7ac550f88e6772d060ea950bdf5944c43b92aad83719a69e20
- Payload ZIP SHA-256: e7002ed5da3fd4d3cb94ab48fb4807301cd685856d3b7a97e1ae1eb9c719e354
- Manifest source commit: 12d65f444a75cac7d18ce6d4b33e285aa7c724c6
- Bundled Node version: v24.15.0
- Bundled node.exe SHA-256: 3331e1ffe19874215472217c5e94f5a0c6d8e18c4ac7111d3937aa0ad5e9b4a5

## Package contents
Runtime payload contains only the bounded local runtime surface:
- bundled node.exe;
- LOCAL-RUNTIME-ADAPTER-001 compiled entry/runtime;
- GP-TEST-001 compiled fixture runtime;
- minimal ESM package marker;
- Start launcher;
- Stop launcher;
- Health launcher;
- Uninstall launcher;
- PowerShell helper scripts;
- installation marker;
- SHA-256 payload manifest.

The package does not ship npm, Vitest, Vite, node_modules, or the development dependency graph.

## Build qualification
PowerShell packaging scripts parse cleanly.
Repository verification at packaging implementation stage:
- typecheck: PASS;
- full deterministic suite: 32 files / 647 tests / 647 PASS;
- build: PASS;
- git diff --check: PASS.

IExpress-specific host issue discovered and repaired:
- Remote Desktop Commander process had TMP unset.
- Build script now sets TMP from TEMP before invoking IExpress.
- Build script waits for IExpress completion.
- modal FinishMessage was removed so automated install can terminate normally.

## Preliminary qualification
A preliminary installer build was installed to an isolated qualification directory.
Results:
- install marker present;
- launcher started runtime;
- listener bound to 127.0.0.1;
- all 14 GP canaries passed;
- stop launcher closed the port;
- uninstall removed the isolated install root.

This preliminary artifact was not accepted as final because it predated the packaging implementation commit.

## Final commit-bound installation qualification
Qualification target:
C:\Users\dyron\Documents\Grimoire\QUAL-INSTALL-002

Installer execution:
- installer exit code: 0;
- install marker present;
- manifest present;
- manifest source commit matched 12d65f444a75cac7d18ce6d4b33e285aa7c724c6;
- all 14 manifest payload file hashes verified;
- bundled Node reported v24.15.0.

Installed runtime:
- Start launcher: PASS;
- exact listener: 127.0.0.1:24701;
- public/wildcard bind: none;
- health adapter ID: LOCAL-RUNTIME-ADAPTER-001;
- fixture ID: GP-TEST-001;
- GP baseline total Water: 12,000,000 GP-WU;
- GP baseline hash: c387fbab785628db092804925fe36f652e8fb2139d3b02de317fe1e3d1d6201f.

## Final installed canary results
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

## Stop and uninstall qualification
- Stop launcher: PASS.
- Port 24701 closed after stop.
- Uninstall launcher: PASS.
- Isolated install root removed.
- Port remained closed after uninstall.

System-residue witness before and after:
- FOTN-named Windows services: 0 → 0.
- FOTN-named scheduled tasks: 0 → 0.
- FOTN-named firewall rules: 0 → 0.

No startup/service/firewall mutation occurred.

## Security and distribution holds
The installer is NOT digitally signed.
Authenticode status: NotSigned.

Implication:
Windows SmartScreen or other reputation controls may warn when the installer is launched, especially when it is transferred/downloaded.

This does not invalidate the local functional qualification, but code signing/reputation is a separate distribution-readiness gate.

Still HELD:
- digital code signing;
- public distribution;
- automatic updates;
- Windows service mode;
- startup registration;
- persistent gameplay sessions;
- network/LAN exposure;
- permanent owner installation.

## Preservation boundary
Preserved:
- parent deterministic runtime;
- parent GP-TEST-001 qualification;
- closed-loop Water law;
- Structural + Thermal law;
- NaShaTa mediation semantics;
- local-only adapter network boundary;
- existing Git qualification lineage.

The installer packages the qualified adapter; it does not rewrite runtime law.

## Final disposition
LOCAL INSTALLATION + LAUNCHER PACKAGING QUALIFICATION 001 — PASS.

The Windows installer is functionally qualified for this owner's local computer as a bounded localhost-only installation artifact.

QUALIFICATION PASS / OWNER LOCK PENDING.

## Next lawful action
Owner lock this packaging qualification, push/integrate the packaging branch, rebuild the installer from the owner-lock-integrated source if required by final release policy, then perform PERMANENT LOCAL INSTALLATION 001 to the owner's chosen local application directory and create the owner-facing shortcut.

Code-signing qualification may be performed before broader distribution, but it is not required to prove local functionality on this already-authorized computer.
