# LOCAL UPDATE BOOTSTRAP REPAIR 001

## Status
IN PROGRESS — qualification before permanent repair.

## Failure evidence
Owner attempted the staged v0.1.1 update from the desktop shortcut.
Windows rejected:
Move-Item -LiteralPath $InstallRoot -Destination $previous

Reason:
the updater launcher and PowerShell script were executing from inside the versioned current directory that the updater was trying to rename.

## Root cause
The update mechanism itself was logically correct, but its bootstrap location violated Windows file/directory usage behavior.

Versioned runtime directory:
%LOCALAPPDATA%\FOTN\LocalRuntimeAdapter\current

The update bootstrap must not execute from inside current while current is being atomically moved.
## Repair contract
Stable update bootstrap home:
%LOCALAPPDATA%\FOTN\LocalRuntimeAdapter\

Stable files:
- Update FOTN Local Runtime.cmd
- Update-LocalRuntime.ps1

Versioned runtime remains:
%LOCALAPPDATA%\FOTN\LocalRuntimeAdapter\current

The desktop Update shortcut must target the stable parent-level CMD.

Runtime update ZIPs must NOT embed/replace the updater bootstrap as part of the current payload.

## Preservation
- current runtime remains localhost-only.
- one-version previous rollback remains.
- manifest/hash verification remains.
- health + 14 GP canaries remain.
- runtime remains stopped after update.
- no service/task/firewall/public network change.
## Qualification plan
1. Commit repair source.
2. Rebuild v0.1.1 from exact repair commit.
3. Create isolated clone with parent/current topology.
4. Place bootstrap in clone parent.
5. Invoke the parent-level CMD, using qualification package discovery from a controlled package path when needed.
6. Require v0.1.0 → v0.1.1 PASS, previous=v0.1.0, all 14 canaries PASS, runtime stopped.
7. Repair permanent parent-level bootstrap and desktop shortcut.
8. Replace Downloads v0.1.1 ZIP with repaired release only after exact hash verification.
9. Apply to permanent installation and verify.

## Qualification result
PASS.

Repair implementation commit:
e535d45c8b98e87ce576ad425ae1f04462310e99

Repaired v0.1.1 package:
- SHA-256: 33c14cf300a597874e9e0461b440a59bc6b56b1f7200af1f878efa25349cd4f9
- source commit: e535d45c8b98e87ce576ad425ae1f04462310e99
- bytes: 34,274,121

Parent-level launcher qualification:
- isolated Windows-like parent/current topology: PASS;
- automatic Downloads discovery: PASS;
- v0.1.0 → v0.1.1: PASS;
- previous v0.1.0 retained: PASS;
- GP health/baseline + 14 canaries: PASS;
- runtime stopped after update: PASS.

## Disposition
LOCAL UPDATE BOOTSTRAP REPAIR 001 — PASS.

The prior v0.1.1 ZIP with SHA-256 2c08204ce9e7fc4cdd4e9f30a1886bcc5b7e36eedbd03b432e4d22aec99ff9db is SUPERSEDED and must not be applied.

The repaired v0.1.1 release with SHA-256 33c14cf300a597874e9e0461b440a59bc6b56b1f7200af1f878efa25349cd4f9 is the qualified replacement.
