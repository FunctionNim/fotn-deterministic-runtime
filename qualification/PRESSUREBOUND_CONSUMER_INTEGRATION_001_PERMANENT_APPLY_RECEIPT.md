# PRESSUREBOUND CONSUMER INTEGRATION 001 — OWNER-LOCKED PERMANENT APPLY RECEIPT

## Status
COMPLETE / OWNER-LOCKED / PERMANENT v0.2.0 APPLIED.

## Source lineage
- Repository: FunctionNim/fotn-deterministic-runtime
- Owner-lock integrated commit: ef29fa804ab12c72d00e5143035fcbbe0d1e2447
- Release: FOTN Local Runtime v0.2.0
- Release source commit: ef29fa804ab12c72d00e5143035fcbbe0d1e2447

## Integrated release artifact
- File: FOTN-Local-Runtime-Update-v0.2.0.zip
- Bytes: 34,443,036
- SHA-256: 2cee9c2a32454843009d47c1c51ab250f9d53fd818c2c289e29e6e0c0f125a75
- Bundled Node: v24.15.0
- Consumer ID: PRESSUREBOUND-CONSUMER-001
- Deployment ID: 1e7065ec-8bd9-481b-bacf-f812810efae0
## Owner-lock clone requalification
The exact integrated v0.2.0 ZIP was applied to a fresh clone of the permanent v0.1.1 installation.

Result:
- current v0.2.0;
- previous v0.1.1;
- source commit exact match;
- updater GP canary 14/14 PASS;
- runtime stopped.

Consumer verification:
- buildVerified=true;
- verifiedFiles=5;
- deployment ID exact match;
- index source SHA exact;
- JavaScript source SHA exact;
- GP baseline hash unchanged;
- localhost-only;
- runtime stopped.
## Permanent update
Permanent install root:
C:\Users\dyron\AppData\Local\FOTN\LocalRuntimeAdapter\current

Permanent update result:
- v0.1.1 -> v0.2.0 PASS;
- previous retained: v0.1.1;
- current source: ef29fa804ab12c72d00e5143035fcbbe0d1e2447;
- updater GP canary: 14/14 PASS;
- runtime stopped after update.

Independent permanent consumer verification:
- /pressurebound/consumer/handshake PASS;
- five files verified;
- exact deployment ID;
- exact index and JS source hashes;
- GP baseline unchanged;
- runtime stopped afterward.
## Stable PRESSUREBOUND launcher
Installed parent-level controls:
- Launch-PRESSUREBOUND.ps1
- Launch PRESSUREBOUND.cmd

Desktop shortcut:
C:\Users\dyron\OneDrive\Desktop\PRESSUREBOUND Local.lnk

Shortcut target:
C:\Users\dyron\AppData\Local\FOTN\LocalRuntimeAdapter\Launch PRESSUREBOUND.cmd

Permanent no-browser launcher qualification:
- PRESSUREBOUND_LOCAL_READY returned;
- consumer handshake PASS;
- buildVerified=true;
- runtime stopped afterward.
## Downloads recovery artifact
C:\Users\dyron\Downloads\FOTN-Local-Runtime-Update-v0.2.0.zip

SHA-256 receipt:
C:\Users\dyron\Downloads\FOTN-Local-Runtime-Update-v0.2.0.sha256.txt

Release SHA-256:
2cee9c2a32454843009d47c1c51ab250f9d53fd818c2c289e29e6e0c0f125a75
## Authority boundary
Qualified:
- actual local PRESSUREBOUND build admitted by exact hashes;
- localhost same-origin hosting;
- runtime handshake and visible connection status;
- drift refusal;
- permanent v0.2.0 update;
- stable owner-facing local launcher.

Still held:
- gameplay transition-authority migration.

Current handshake remains:
- gameplayAuthority=BROWSER_BUNDLED_ENGINE_PRESERVED
- transitionAuthority=HELD_MATCHING_SOURCE_REQUIRED

No older AppDeploy source was substituted for the current build.
## Final disposition
PRESSUREBOUND CONSUMER INTEGRATION 001 — OWNER-LOCKED PERMANENT APPLY COMPLETE.

Current permanent runtime: v0.2.0.
Previous rollback runtime: v0.1.1.
Resting state: STOPPED.

Owner may launch the verified local game by double-clicking:
PRESSUREBOUND Local
on the desktop.
