# LOCAL UPDATE CHANNEL QUALIFICATION 001 — RECEIPT

## Status
QUALIFICATION PASS / OWNER LOCK PENDING.

No unattended Internet polling, auto-download, public update service, startup task, Windows service, firewall change, or LAN/public exposure was created.

## Source binding
- Repository: FunctionNim/fotn-deterministic-runtime
- Parent integrated main: 02edc50d0c721c5b7c780e3c78275ba6a4c7e69a
- Update branch: local-update-channel-v0-1
- Update implementation commit: cafb7fdba6edc64eae08198f75e6f95cc71f9c8a
- Update implementation tree: 06e834a4f27e563509a2ab68660b746455651d27

## Channel contract
The local update channel:
- accepts a local FOTN update ZIP;
- verifies product identity and SHA-256 manifest;
- stages beside the current installation;
- stops the current runtime;
- preserves one previous version;
- swaps staged payload into current;
- starts the candidate on loopback only;
- verifies health, baseline, and all 14 GP canaries;
- stops the candidate after verification;
- automatically restores the previous version when post-swap verification fails.
## Qualification packages
Valid qualification update:
- version: 0.1.1
- source commit: cafb7fdba6edc64eae08198f75e6f95cc71f9c8a
- file: FOTN-Local-Runtime-Update-v0.1.1.zip
- SHA-256: 62b0c56ffcc8bd456aacc57553bb79d4f9d0615a9f3a09404a2c1d8fcee99662
- bytes: 34,274,515
- fault mode: None

Rollback qualification package:
- version: 0.1.2
- source commit: cafb7fdba6edc64eae08198f75e6f95cc71f9c8a
- file: FOTN-Local-Runtime-Update-v0.1.2-BadHealth.zip
- SHA-256: 3a760fffdb936539cdf0b2c7300967ee6c3ac2cc4152957141694f6d47153258
- bytes: 34,274,544
- fault mode: BadHealth
## Forward-update qualification
Qualification clone began from the permanent v0.1.0 installed payload.

Update:
v0.1.0 → v0.1.1

Result:
PASS.

After update:
- current marker version: 0.1.1;
- current source commit: cafb7fdba6edc64eae08198f75e6f95cc71f9c8a;
- previous marker version: 0.1.0;
- previous source commit: 12d65f444a75cac7d18ce6d4b33e285aa7c724c6;
- GP baseline hash: c387fbab785628db092804925fe36f652e8fb2139d3b02de317fe1e3d1d6201f;
- all 14 GP canaries: PASS;
- qualification port closed after update verification.

The updater left the updated runtime stopped.
## Automatic rollback qualification
A manifest-valid v0.1.2 package with intentionally broken health identity was applied to the v0.1.1 qualification clone.

Expected post-swap health failure occurred.

Updater disposition:
UPDATE_ROLLED_BACK.

Restored current:
- version: 0.1.1;
- source commit: cafb7fdba6edc64eae08198f75e6f95cc71f9c8a.

Restored verification:
- health identity: PASS;
- GPF-001 through GPF-014: all PASS;
- runtime stopped after rollback verification.

The previous directory was consumed to restore the failed update, as intended.
The broken v0.1.2 did not remain current.
## Permanent installation bootstrap
Permanent install root:
C:\Users\dyron\AppData\Local\FOTN\LocalRuntimeAdapter\current

Permanent runtime version before bootstrap:
0.1.0.

Added only:
- scripts\Update-LocalRuntime.ps1
- Update FOTN Local Runtime.cmd
- desktop shortcut: Update FOTN Local Runtime.lnk

Updater script SHA-256:
9873b7bfcc681efe8ba30bee81865106fc5d3290b30c334505f02752a3643b83

Update launcher SHA-256:
8465d7b45c57686c69cea64ce9bb0f7fca73322f6c7ceb4005e143e1a16f1d2d

Permanent runtime version after bootstrap:
0.1.0.

No runtime version update was performed on the permanent installation during qualification.
## Permanent channel behavior
If no explicit package path is supplied, the installed updater searches the owner's Downloads folder for the newest file matching:
FOTN-Local-Runtime-Update-v*.zip

No qualification package was copied to Downloads.

Therefore:
- the desktop Update shortcut is present;
- the permanent runtime cannot accidentally consume the qualification update;
- future owner-locked releases can be placed in Downloads and applied without uninstall/reinstall.

The update channel is local-package driven.
It does not contact GitHub or any public update server by itself.
## Preservation and system boundary
Before and after permanent updater bootstrap:
- FOTN-named Windows services: unchanged at 0;
- FOTN-named scheduled tasks: unchanged at 0;
- FOTN-named firewall rules: unchanged at 0.

Preserved:
- localhost-only runtime;
- permanent runtime v0.1.0;
- GP-TEST-001 identity and canaries;
- Water conservation;
- structural load accounting;
- thermal accounting;
- NaShaTa mediation semantics;
- owner-locked installation lineage.

No service, startup registration, firewall mutation, or public listener was created.
## Final disposition
LOCAL UPDATE CHANNEL QUALIFICATION 001 — PASS.

The installed local runtime now has a qualified update mechanism that can replace future owner-locked releases without manual uninstall/reinstall.

The mechanism has proven:
- verified staging;
- one-version preservation;
- forward update;
- post-update canary verification;
- automatic rollback after post-swap failure;
- stopped resting state.

QUALIFICATION PASS / OWNER LOCK PENDING.

## Next lawful action
Owner lock this qualification, push/integrate local-update-channel-v0-1, then build the first real owner-locked update release.

A later AUTO-UPDATE DISCOVERY qualification may add controlled remote discovery, but this local channel intentionally performs no unattended network activity.
