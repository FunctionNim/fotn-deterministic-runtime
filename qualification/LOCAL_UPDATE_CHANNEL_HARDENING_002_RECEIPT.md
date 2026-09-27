# LOCAL UPDATE CHANNEL HARDENING 002 — QUALIFICATION RECEIPT

## Status
QUALIFICATION PASS WITH SIGNING CERTIFICATE HOLD / OWNER LOCKED.

Functional hardening is complete.
Trusted Authenticode release signing is not complete because no usable code-signing certificate with private key is installed on the authorized Windows host.

## Target binding
- Device: AaronM
- Repository: FunctionNim/fotn-deterministic-runtime
- Parent main: 02ee4a59bd84e88c31b6254066705c29d95d5767
- Branch: local-update-hardening-v0-2
- Hardening implementation commit: 1590eab7f4ec5cd7d0b97fc08c5f85034b94b3d6
- Quiescence fix commit: 43992f4a69797fe62916d81e934341db82408ef7
- Payload-boundary fix commit: 8a94f83be1583764b9b65a2f2c37f5b274d05d4e
- Rollback UX/signature verifier commit: 85d04c03c2598941512317edc2b162331a655fac
## Baseline
Before hardening:
- npm ci: PASS
- typecheck: PASS
- full deterministic suite: 32 files / 647 tests / 647 PASS
- build: PASS
- worktree clean

Permanent runtime before bootstrap:
- current: v0.1.1
- current source: 34ba73e86d510af76d45a19f07cc55f5dd76799b
- previous: v0.1.0
- previous source: 12d65f444a75cac7d18ce6d4b33e285aa7c724c6
- runtime state: STOPPED
## Version/status visibility
Added:
- Show-LocalRuntimeStatus.ps1
- FOTN Runtime Status.cmd

The status surface reports:
- installed version and source commit;
- previous version and source commit;
- runtime RUNNING/STOPPED state;
- localhost host/port;
- last ledger action/result;
- last canary count;
- last baseline hash;
- last event timestamp;
- signing readiness.

Permanent status after bootstrap:
- Installed: 0.1.1
- Previous: 0.1.0
- Runtime: STOPPED
- LastAction: HARDENING_BOOTSTRAP_PASS
- LastResult: PASS
- LastCanaries: 14
- LastBaselineHash: c387fbab785628db092804925fe36f652e8fb2139d3b02de317fe1e3d1d6201f
- Signing: CERTIFICATE_REQUIRED
## Append-only update history
Added:
- Write-UpdateHistory.ps1
- parent-level history\update-history.ndjson

Ledger contract:
- one compact JSON object per line;
- append only;
- UTC timestamp added by helper;
- no secret/private-key material;
- prior lines are not rewritten.

Append-only qualification:
- first ledger line preserved exactly after second append: PASS.

Update ledger qualification:
- successful v0.1.1 → v0.1.2 test update wrote UPDATE_PASS;
- package SHA-256 recorded;
- source commit recorded;
- baseline hash recorded;
- canaries=14 recorded.

Failed v0.1.3 test update:
- candidate failed live health as designed;
- v0.1.2 restored;
- UPDATE_ROLLBACK written;
- attempted version/source/package hash and restored version recorded;
- all 14 restored canaries PASS.
## Manual rollback UX
Added:
- Rollback-LocalRuntime.ps1
- Rollback FOTN Local Runtime.cmd
- owner confirmation prompt before rollback.

Qualification:
1. v0.1.1 → v0.1.0: PASS.
   - all 14 GP canaries PASS;
   - v0.1.1 retained as previous;
   - runtime stopped.

2. v0.1.0 → v0.1.1: PASS.
   - all 14 GP canaries PASS;
   - v0.1.0 retained as previous;
   - runtime stopped.

Windows quiescence finding:
an immediate reverse rollback initially encountered a transient directory-handle denial after the first canary stop.

Correction:
- bounded directory move retry added to rollback and updater;
- 20 attempts × 250 ms maximum;
- verification still requires closed port and valid markers.

Reverse rollback after correction: PASS.
## Failed rollback restoration
The previous candidate was deliberately corrupted to report BROKEN-RUNTIME-ADAPTER-001.

Expected result:
- rollback candidate started but failed health qualification;
- rollback script restored the original current v0.1.1;
- failed candidate returned to previous position;
- restored v0.1.1 passed all 14 GP canaries;
- runtime stopped;
- ledger appended MANUAL_ROLLBACK_RESTORED_CURRENT.

Result: PASS.

This proves manual rollback is not allowed to replace a healthy current version with an unhealthy previous version.
## Update payload boundary
The stable updater remains outside the versioned current runtime.

Build-LocalRuntimeUpdate.ps1 no longer copies Update-LocalRuntime.ps1 into the versioned payload.

Qualified topology:
LocalRuntimeAdapter\
  current\
  previous\
  Update FOTN Local Runtime.cmd
  Update-LocalRuntime.ps1
  Write-UpdateHistory.ps1
  Rollback FOTN Local Runtime.cmd
  Rollback-LocalRuntime.ps1
  FOTN Runtime Status.cmd
  Show-LocalRuntimeStatus.ps1
  history\update-history.ndjson

This preserves the repaired Windows atomic-swap architecture.
## Signing readiness and verification
Windows SDK x64 SignTool:
C:\Program Files (x86)\Windows Kits\10\bin\10.0.26100.0\x64\signtool.exe

Usable code-signing certificates with private key:
0.

Signing readiness result:
CERTIFICATE_REQUIRED.

Added:
- Get-SigningReadiness.ps1
- Sign-FOTNRelease.ps1
- Verify-FOTNReleaseSignature.ps1

Signing script contract:
- explicit file path;
- explicit certificate thumbprint;
- explicit timestamp URL;
- SHA-256 file digest;
- RFC3161 timestamp with SHA-256 timestamp digest;
- post-sign SignTool verification using default authentication policy.

Negative qualification:
- unsigned v0.1.0 installer reports NotSigned;
- dummy thumbprint is rejected with CERTIFICATE_REQUIRED_OR_INVALID_THUMBPRINT;
- no certificate, private key, or trust store was created or modified.
## Permanent bootstrap
Copied to stable permanent parent:
- hardened Update-LocalRuntime.ps1;
- Write-UpdateHistory.ps1;
- Rollback-LocalRuntime.ps1;
- Show-LocalRuntimeStatus.ps1;
- Update launcher;
- Status launcher;
- Rollback launcher.

Desktop shortcuts created:
- FOTN Runtime Status
- Rollback FOTN Local Runtime

Existing Update FOTN Local Runtime remains parent-level.

Permanent runtime was exercised after bootstrap:
- localhost health PASS;
- GP baseline PASS;
- GPF-001 through GPF-014 PASS;
- runtime stopped afterward.

Ledger appended HARDENING_BOOTSTRAP_PASS.
## System boundary
Permanent current remains:
v0.1.1.

Permanent previous remains:
v0.1.0.

Runtime resting state:
STOPPED.

Before/after hardening bootstrap:
- FOTN-named Windows services: unchanged;
- FOTN-named scheduled tasks: unchanged;
- FOTN-named firewall rules: unchanged.

No public/LAN listener, startup registration, service, scheduled task, or firewall rule was created.

## External signing guidance
Microsoft SignTool documentation identifies SignTool as the Windows signing/verification tool.
Microsoft guidance recommends SHA-256 file digests and RFC3161 timestamping with SHA-256 for modern Authenticode signatures.
Actual trusted signing requires an appropriate code-signing certificate and is therefore held.
## Final disposition
LOCAL UPDATE CHANNEL HARDENING 002 — FUNCTIONAL PASS.

PASS:
- version visibility;
- rollback UX;
- append-only ledger;
- update success ledger;
- automatic update rollback ledger;
- manual rollback both directions;
- failed rollback restoration;
- Windows quiescence handling;
- permanent hardening bootstrap;
- signing readiness and verification pipeline.

HELD:
- actual trusted signed release, pending a usable code-signing certificate with private key.

## Next lawful action
Owner lock granted in the active project conversation. Push local-update-hardening-v0-2 and integrate it into main only if remote main remains at the verified parent commit.

After integration:
- functional update/rollback/status operation may continue normally;
- SIGNED RELEASE QUALIFICATION remains held until a trusted certificate is explicitly provisioned;
- no trust-store or private-key enrollment should occur implicitly.

## Final verification
- PowerShell parse checks: PASS.
- Formal runbook validator: PASS with no remaining warnings after explicit approval-gate wording.
- Typecheck: PASS.
- Full deterministic regression: 32 files / 647 tests / 647 PASS.
- Build: PASS.
- git diff --check: PASS.
- Permanent runtime after hardening: v0.1.1 current / v0.1.0 previous / STOPPED.
- Permanent GP canary after bootstrap: 14/14 PASS.
