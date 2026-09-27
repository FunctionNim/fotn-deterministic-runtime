# OWNER-LOCKED RUNTIME UPDATE RELEASE 001 — v0.1.1

## Status
OWNER-LOCKED / RELEASE QUALIFICATION PASS / READY FOR OWNER APPLY.

This release is prepared for the permanent FOTN Local Runtime Adapter installation but has not yet been applied to the permanent runtime.

## Release identity
- Product: FOTN Local Runtime Adapter
- Release: v0.1.1
- Release class: first real owner-locked local update release
- Source repository: FunctionNim/fotn-deterministic-runtime
- Owner-locked source commit: b292e97950c215d985192eb6e4477c5c86ce9d4a
- Update channel qualification: LOCAL UPDATE CHANNEL QUALIFICATION 001 — OWNER LOCKED
## Artifact
- File: FOTN-Local-Runtime-Update-v0.1.1.zip
- Bytes: 34,274,522
- SHA-256: 2c08204ce9e7fc4cdd4e9f30a1886bcc5b7e36eedbd03b432e4d22aec99ff9db
- Fault mode: None
- Bundled Node: v24.15.0
- Bundled node.exe SHA-256: 3331e1ffe19874215472217c5e94f5a0c6d8e18c4ac7111d3937aa0ad5e9b4a5

The update package was rebuilt after owner lock and integration.
It is not the earlier qualification package.
## Release qualification
Qualification began from a fresh clone of the permanent v0.1.0 installation.

Exact package applied:
SHA-256 2c08204ce9e7fc4cdd4e9f30a1886bcc5b7e36eedbd03b432e4d22aec99ff9db.

Result:
- v0.1.0 → v0.1.1: PASS.
- updated source commit: b292e97950c215d985192eb6e4477c5c86ce9d4a.
- previous version retained: v0.1.0.
- health identity: PASS.
- GP baseline hash: c387fbab785628db092804925fe36f652e8fb2139d3b02de317fe1e3d1d6201f.
- all 14 GP canaries: PASS.
- runtime stopped after verification.
## Owner Downloads placement
Qualified release copied to:

C:\Users\dyron\Downloads\FOTN-Local-Runtime-Update-v0.1.1.zip

Hash receipt:
C:\Users\dyron\Downloads\FOTN-Local-Runtime-Update-v0.1.1.sha256.txt

Release note:
C:\Users\dyron\Downloads\FOTN-Local-Runtime-Update-v0.1.1.release.txt

The permanent updater desktop shortcut will discover this ZIP automatically.
## Permanent installation state
At release preparation completion:
- permanent installed version: v0.1.0;
- runtime state: stopped;
- update shortcut: present;
- release ZIP in Downloads: present;
- update not yet applied.

This preserves a deliberate owner action between release preparation and installed-version mutation.

## Apply path
Owner-facing action:
Double-click **Update FOTN Local Runtime** on the desktop.

Expected updater behavior:
1. discover v0.1.1 ZIP in Downloads;
2. verify product/manifest/hashes;
3. preserve current v0.1.0 as previous;
4. stage and swap v0.1.1;
5. start candidate on localhost only;
6. run health + GP baseline + all 14 canaries;
7. stop candidate;
8. retain v0.1.1 on success;
9. automatically restore v0.1.0 on failure.
## Security / distribution boundary
This release is local-package driven.
It performs no remote discovery or unattended download.

Still held:
- public update server;
- unattended auto-update;
- code signing;
- LAN/public exposure;
- Windows service;
- startup registration.

## Final disposition
OWNER-LOCKED RUNTIME UPDATE RELEASE 001 — v0.1.1 — READY FOR OWNER APPLY.

No permanent runtime version change occurred during release preparation.
