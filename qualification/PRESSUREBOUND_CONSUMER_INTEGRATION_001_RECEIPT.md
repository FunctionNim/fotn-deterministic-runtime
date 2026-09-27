# PRESSUREBOUND CONSUMER INTEGRATION 001 — QUALIFICATION RECEIPT

## Status
QUALIFICATION PASS / OWNER LOCK PENDING.

This pass connects the actual current local PRESSUREBOUND build to the installed FOTN local runtime as a verified same-origin consumer.

It does NOT claim gameplay transition-authority migration. The current browser-bundled gameplay engine remains authoritative until matching editable source is qualified for migration.

## Source binding
- Repository: FunctionNim/fotn-deterministic-runtime
- Parent main: 9addfbc7b38e998ffb97ec36eac958d85417d074
- Branch: pressurebound-consumer-integration-v0-1
- Implementation commit: 420e6c6ddce26c035a4cea69fd59316fcafd1d98
- Implementation tree: 5a592d004c40177a2f8150ed044b2379404f57a6
- Consumer ID: PRESSUREBOUND-CONSUMER-001
- Deployment marker: 1e7065ec-8bd9-481b-bacf-f812810efae0
## Actual PRESSUREBOUND build binding
Source location qualified:
C:\Users\dyron\Desktop\PRESSUREBOUND Local

Five bound files:
- assets/index-BReWkrRU.css — 108515 bytes — SHA-256 8be4ea3ed261a26b5ca94cafa07cc0293a57e50516324bbda1104f35d302ad2c
- assets/index-D1PxQTgs.js — 487967 bytes — SHA-256 824cfb5710df514a64d3a1f2202ada356e34a0b8fb70b9dec49ad00677a8d178
- favicon.svg — 163 bytes — SHA-256 8ffbde9092b1fa4de97c9481b76f518b131268c82e7c555041925225b1dab6e0
- index.html — 1140 bytes — SHA-256 4194f6e0b4a442198faf93ebf1f2d2de35a6134a058ce75f5a29d04714ca9abc
- robots.txt — 23 bytes — SHA-256 16ceb5ee3e0dc13aa9adf31a3ebbe45a1d965b8c2b9f72eaf84e5911e140ed95

Packaged copies matched every source byte count and SHA-256 exactly.
## Identity markers
The bound JavaScript contains all required markers:
- deployment ID 1e7065ec-8bd9-481b-bacf-f812810efae0
- PRESSUREBOUND_PROTECTED_RULE_ENGINE_V1
- pressurebound:qualified-durable-save:v1

Any future mismatch is a consumer-build HOLD and the runtime refuses to serve the build.

## Runtime consumer behavior
Added:
- /pressurebound/
- /pressurebound/consumer/handshake
- exact-hash static asset hosting
- serve-time status injection into index.html only

The original files on disk are not rewritten.
## Consumer authority boundary
Qualified handshake reports:
- gameplayAuthority: BROWSER_BUNDLED_ENGINE_PRESERVED
- transitionAuthority: HELD_MATCHING_SOURCE_REQUIRED
- runtimeConnection: LOCALHOST_SAME_ORIGIN
- localOnly: true

The installed runtime now verifies, hosts, and witnesses the actual game build.
It does not silently replace the game's deterministic transition engine.

The older editable AppDeploy source snapshot was inspected but does not match the current local build and was therefore not substituted for it.
## Focused source qualification
Before packaging:
- Typecheck: PASS
- PRESSUREBOUND consumer tests: 4/4 PASS
- Existing local-runtime adapter tests: 23/23 PASS
- Build: PASS
- git diff --check: PASS

Consumer tests prove:
- complete bound build PASS
- one-file drift HOLD
- same-origin handshake injection
- source SHA response headers
- 503 refusal for drifted consumer build
## Runtime v0.2.0 artifact
Commit-bound package:
FOTN-Local-Runtime-Update-v0.2.0.zip

- Version: 0.2.0
- Source commit: 420e6c6ddce26c035a4cea69fd59316fcafd1d98
- Bytes: 34443039
- SHA-256: ae096aa21d33547a576c7fc7c1c84ea231dde4b4583804c5c27e55ee283a6061
- Bundled Node: v24.15.0
- Bundled node.exe SHA-256: 3331e1ffe19874215472217c5e94f5a0c6d8e18c4ac7111d3937aa0ad5e9b4a5

The update manifest records PRESSUREBOUND-CONSUMER-001 and the deployment ID.
## Clone update qualification
Qualification root:
C:\Users\dyron\Documents\Grimoire\QUAL-PRESSUREBOUND-CONSUMER-001

Exact v0.2.0 package was applied through the already-qualified updater.

Result:
- current: v0.2.0
- current source: 420e6c6ddce26c035a4cea69fd59316fcafd1d98
- previous: v0.1.1
- updater GP canary: 14/14 PASS
- GP baseline hash: c387fbab785628db092804925fe36f652e8fb2139d3b02de317fe1e3d1d6201f
- runtime stopped after update verification
## Consumer HTTP qualification
Updated clone started on verified-free port 24841.

Handshake:
- status: ok
- buildVerified: true
- verifiedFiles: 5
- deployment ID: exact match
- localOnly: true

Served index:
- HTTP 200
- x-pressurebound-source-sha256 = 4194f6e0b4a442198faf93ebf1f2d2de35a6134a058ce75f5a29d04714ca9abc
- x-pressurebound-consumer-injected = true
- injected runtime status script present

Served JavaScript source hash header matched 824cfb5710df514a64d3a1f2202ada356e34a0b8fb70b9dec49ad00677a8d178.
## Stable launcher qualification
Parent-level launcher:
- Launch-PRESSUREBOUND.ps1
- Launch PRESSUREBOUND.cmd

Qualification port: 24842.

Result:
- runtime start: PASS
- consumer handshake: PASS
- buildVerified: true
- deployment identity: exact match
- launch URL: /pressurebound/
- runtime stopped after qualification

The existing hosted PRESSUREBOUND shortcut was not altered.
## Qualification-port collision evidence
The first clone attempt used port 24741.

That port was already occupied by an older qualified local adapter process.
The updater's stop gate detected that the port remained occupied and rejected the candidate qualification.

Updater rollback restored:
- current v0.1.1
- previous v0.1.0

No permanent runtime mutation occurred.

The qualification was rebuilt and repeated on verified-free port 24841, where it passed.
This event is evidence that the update stop/rollback gate refused ambiguous port ownership rather than silently accepting it.
## Full regression
Final repository verification:
- Test files: 33/33 PASS
- Tests: 651/651 PASS
- Typecheck: PASS
- Production build: PASS
- git diff --check: PASS

The four new consumer tests raise the suite from 647 to 651 tests.

## Preservation verification
Permanent installed runtime after qualification:
- version: v0.1.1
- source: 34ba73e86d510af76d45a19f07cc55f5dd76799b
- state: STOPPED

Original desktop PRESSUREBOUND five-file build:
UNCHANGED / all five SHA-256 values reverified.
## Final disposition
PRESSUREBOUND CONSUMER INTEGRATION 001 — PASS.

Qualified now:
- actual local game identity
- exact-hash consumer admission
- localhost same-origin game hosting
- visible runtime handshake
- drift refusal
- v0.2.0 packaging
- cloned update
- stable local launcher
- preservation of GP runtime behavior

Still HELD:
- permanent v0.2.0 installation
- owner-facing local PRESSUREBOUND launcher installation
- branch push/integration
- gameplay transition-authority migration
- replacement of browser-bundled engine
## Next lawful action
Owner lock PRESSUREBOUND CONSUMER INTEGRATION 001.

After owner lock:
1. push and integrate pressurebound-consumer-integration-v0-1;
2. rebuild v0.2.0 from the owner-lock-integrated commit;
3. requalify that exact release package;
4. update the permanent runtime from v0.1.1 to the integrated v0.2.0 release;
5. install the stable owner-facing PRESSUREBOUND Local launcher;
6. leave transition-authority migration as a separately qualified follow-on requiring matching editable game source.
