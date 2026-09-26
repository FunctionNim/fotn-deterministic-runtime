# ACCQ-003 — Stewardship / Memory Clock Family 001 — Operational Qualification Runbook

## Metadata

- **Status:** Approved
- **Owner:** Aaron
- **Operator:** Authorized ChatGPT/operator acting on the verified FunctionNim checkout
- **Last verified:** 2026-09-26
- **Environment:** Local Windows checkout on device AaronM; repository FunctionNim/fotn-deterministic-runtime
- **Expected duration:** One bounded operator session; no wall-clock game cadence is implied
- **Change/incident ID:** ACCQ-003-RUNBOOK-001
- **Qualified source branch:** artificial-civilization-stewardship-memory-clock-001-v0-1
- **Qualified source commit:** 69be1e4b63f3348e8ad468246c67ee80eb08d0eb
- **Qualified source tree:** ffa115d33f8dd7faf997c5ed2218b68e008640ac
- **Repository root:** C:\Users\dyron\OneDrive\Documents\GitHub\fotn-gamerlastone-aperture-001
- **Remote identity:** https://github.com/FunctionNim/fotn-deterministic-runtime.git
- **Drive matrix:** ARTIFICIAL CIVILIZATION CLOCK QUALIFICATION 001 — Runtime Contract Matrix v0.1
- **Drive matrix ID:** 1PJuiti13sCiQ5Ud7IkJiLwIIi0yvtzusTP1HYi5p03E

## Objective

Reproduce and verify the bounded ACCQ-003 Stewardship / Memory clock-family qualification without widening artificial-civilization scope. The procedure proves exactly one additional local clock family can produce B-HIST-002 from Civilization B's already-committed B-HIST-001 while preserving local authorship, deterministic replay, source simulation integrity, and the existing GamerLaStone human-witness result.

## Scope

**Included**

- src/artificial-civilization/stewardship-memory-clock-family-001.ts
- tests/artificial-civilization/stewardship-memory-clock-family-001.test.ts
- qualification/ACCQ_003_STEWARDSHIP_MEMORY_CLOCK_FAMILY_001.md
- Existing ACCQ-002 source fixture as a read-only dependency
- Existing GamerLaStone Aperture Trial 001 tests as regression protection
- Google Drive ACCQ-001 runtime matrix as source/receipt registry
- Git branch artificial-civilization-stewardship-memory-clock-001-v0-1

**Excluded**

- Adding a second new clock family
- Changing exact cadence or mapping a cycle to day, season, year, generation, or era
- Creating a global calendar
- Giving Underflow scheduling authority
- Changing NaShaTa semantics
- Rewriting ACCQ-002
- Rewriting GamerLaStone Aperture Trial 001 or its human-witness receipts
- Citizen Hematology elapsed-time automation
- Canon promotion
- Production deployment

**Must remain unchanged**

- ACCQ-002 source simulation hash during ACCQ-003 execution
- Civilization A remains causal origin only; it does not directly author B-HIST-002
- B-HIST-002 must source B-HIST-001, not A-HIST-001
- Exact cadence remains HOLD
- GamerLaStone remains downstream witness architecture
- Existing deterministic regression remains green

## Preconditions

- [ ] Repository target gate resolves to FunctionNim/fotn-deterministic-runtime.
- [ ] Current branch is artificial-civilization-stewardship-memory-clock-001-v0-1.
- [ ] HEAD is 69be1e4b63f3348e8ad468246c67ee80eb08d0eb before execution against the qualified source.
- [ ] Worktree is clean before qualification execution.
- [ ] Node.js and npm are available.
- [ ] Python is available for runbook validation.
- [ ] Google Drive matrix ID 1PJuiti13sCiQ5Ud7IkJiLwIIi0yvtzusTP1HYi5p03E is readable before any receipt write.
- [ ] Operator has explicit authorization before any Git push or Google Drive write.
- [ ] No secret, credential, token, or private reviewer data is written to evidence.

## Risk and stop conditions

- **Risk:** Target drift. A different branch, commit, repository, or dirty worktree can invalidate the qualification context.
- **Risk:** Scope expansion. A second clock family, cadence rule, global scheduler, or remote mutation path would exceed ACCQ-003.
- **Risk:** Provenance break. B-HIST-002 pointing directly to A-HIST-001 would erase Civilization B's local authorship boundary.
- **Risk:** Regression. Existing ACCQ-002, GamerLaStone, typecheck, build, or full deterministic tests may fail.
- **Risk:** Evidence drift. Recording PASS in Drive or Git before tests complete would create false qualification evidence.
- **Stop immediately if:** repository identity, branch, or qualified source commit differs before execution.
- **Stop immediately if:** the worktree contains unexpected pre-existing changes.
- **Stop immediately if:** ACCQ-002 source simulation hash changes during the extension.
- **Stop immediately if:** B-HIST-002 bypasses B-HIST-001 and cites A-HIST-001 as its direct source.
- **Stop immediately if:** exact cadence becomes anything other than HOLD.
- **Stop immediately if:** any focused or full regression test fails.
- **Stop immediately if:** typecheck or production build fails.
- **Stop immediately if:** a repair would require destructive Git reset, file deletion, history rewrite, or unapproved Drive mutation.
- **Stop immediately if:** credentials, secrets, unrelated user data, or contradictory verification signals appear.

## Evidence plan

- Record: repository branch, full commit SHA, tree hash, clean/dirty state, focused test counts, full test counts, typecheck result, build result, qualification disposition, and exact cadence status.
- Store in: qualification/ACCQ_003_STEWARDSHIP_MEMORY_CLOCK_FAMILY_001.md, Git commit history, and the existing ACCQ-001 Drive matrix START HERE / LOCAL CLOCKS / CHANGE LOG surfaces.
- Preserve: the prior GamerLaStone human-witness receipts as historical evidence; do not overwrite them.
- Never record: passwords, API keys, bearer tokens, private credentials, unrelated personal data, or fabricated human-witness claims.

## Procedure

### Phase 1 — Verify repository target

1. **Action:** Run the repository target inspector against the exact qualified branch and commit.
   - **Expected result:** Repository root, remote, branch, HEAD, and tree match the Metadata section; worktree is clean.
   - **Verify:** Inspector reports no failures, branch artificial-civilization-stewardship-memory-clock-001-v0-1, HEAD 69be1e4b63f3348e8ad468246c67ee80eb08d0eb, tree ffa115d33f8dd7faf997c5ed2218b68e008640ac, dirty false.
   - **If verification fails:** Stop. Do not switch, reset, merge, fetch, or repair implicitly. Resolve target ownership separately.
   - **Approval required:** None; read-only.

### Phase 2 — Verify bounded source files

1. **Action:** Inspect the three ACCQ-003 files and the ACCQ-002/GamerLaStone dependency files without editing them.
   - **Expected result:** ACCQ-003 defines STEWARDSHIP_MEMORY as the sole added family; source provenance is B-HIST-001 → B-HIST-002; exactCadenceStatus is HOLD.
   - **Verify:** Search/read confirms no second additional family and no direct B-HIST-002 source link to A-HIST-001.
   - **If verification fails:** Stop and classify as source drift. Do not infer intended content.
   - **Approval required:** None; read-only.

### Phase 3 — Execute focused qualification

1. **Action:** From the repository root run:
```text
npx vitest run tests/artificial-civilization/stewardship-memory-clock-family-001.test.ts tests/artificial-civilization/two-civilization-minimal-slice.test.ts tests/gamerlastone/aperture-trial-001.test.ts
```
   - **Expected result:** Three test files pass; 25 tests pass.
   - **Verify:** Stewardship/Memory focused tests are 7/7 PASS, ACCQ-002 tests are 10/10 PASS, GamerLaStone aperture tests are 8/8 PASS.
   - **If verification fails:** Stop. Preserve output. Do not update Drive or Git qualification status.
   - **Approval required:** None; read-only execution.

2. **Action:** Run:
```text
npm run typecheck
```
   - **Expected result:** TypeScript typecheck exits 0.
   - **Verify:** No TypeScript errors are emitted.
   - **If verification fails:** Stop and preserve compiler output.
   - **Approval required:** None.

### Phase 4 — Execute full deterministic regression

1. **Action:** Run:
```text
npm test
```
   - **Expected result:** 34 test files and 638 tests pass.
   - **Verify:** Final Vitest summary reports 34 passed files and 638 passed tests with zero failures.
   - **If verification fails:** Stop. Do not downgrade the failure into a warning.
   - **Approval required:** None.

2. **Action:** Run:
```text
npm run build
```
   - **Expected result:** Production TypeScript build exits 0.
   - **Verify:** Command completes without compiler error.
   - **If verification fails:** Stop and preserve output.
   - **Approval required:** None.

### Phase 5 — Verify the eleven ACCQ-003 gates

1. **Action:** Confirm all eleven qualification requirements in the ACCQ-003 qualification file.
   - **Expected result:** Every gate is satisfied:
     1. exactly one additional clock family;
     2. family identity STEWARDSHIP_MEMORY;
     3. B-HIST-001 exists before B-HIST-002;
     4. B-HIST-002 is authored inside Civilization B;
     5. B-HIST-002 points to B-HIST-001;
     6. no direct A-HIST-001 → B-HIST-002 shortcut;
     7. exact cadence remains HOLD;
     8. qualified ACCQ-002 source hash remains unchanged;
     9. repeated execution is byte-identical;
     10. repeated execution yields the same SHA-256 result;
     11. full deterministic regression remains green.
   - **Verify:** Focused tests, full regression, and qualification record agree.
   - **If verification fails:** Stop. Mark the run NOT QUALIFIED; do not write PASS externally.
   - **Approval required:** None.

### Phase 6 — Record qualification evidence

1. **Action:** Append a sanitized execution receipt to qualification/ACCQ_003_STEWARDSHIP_MEMORY_CLOCK_FAMILY_001.md only after Phases 1–5 pass.
   - **Expected result:** Receipt records date, test counts, typecheck/build PASS, unchanged source hash, cadence HOLD, and bounded scope.
   - **Verify:** Git diff contains only the intended receipt text.
   - **If verification fails:** Revert only the uncommitted receipt edit; do not alter source/test files.
   - **Approval required:** None for local file edit.

2. **Action:** Update the existing Drive matrix START HERE, LOCAL CLOCKS, and CHANGE LOG with the same bounded receipt.
   - **Expected result:** Drive records one ACCQ-003 Stewardship/Memory family, B-HIST-001 → B-HIST-002, cadence HOLD, test totals, and Git branch/commit.
   - **Verify:** Re-read the exact written ranges and confirm they match the local receipt.
   - **If verification fails:** Stop. Do not overwrite unrelated cells or broaden the range.
   - **Approval required:** Yes — Gate 2 external change. Owner authorization must exist for the Drive write.

### Phase 7 — Publish the run result

1. **Action:** Review `git status --short` and `git diff --check`.
   - **Expected result:** Only intended qualification/runbook receipt changes are present; diff check is clean.
   - **Verify:** No unrelated source, generated, credential, or personal files are staged.
   - **If verification fails:** Stop and unstage only the unintended files; do not delete them.
   - **Approval required:** None.

2. **Action:** Commit the intended bounded evidence change with a descriptive message.
   - **Expected result:** One new commit containing only approved evidence/runbook changes.
   - **Verify:** `git show --stat --oneline HEAD` matches intended files.
   - **If verification fails:** Stop before push.
   - **Approval required:** Yes — reversible local Git change.

3. **Action:** Push only the verified branch to origin.
   - **Expected result:** Remote branch advances to the new evidence/runbook commit without affecting other branches.
   - **Verify:** GitHub remote branch and commit SHA match local HEAD.
   - **If verification fails:** Stop. Do not force-push.
   - **Approval required:** Yes — Gate 2 external change. Owner authorization required.

## Rollback

- **Trigger:** An unintended local edit is made before commit, an evidence receipt is incorrect, or the runbook/evidence commit must be abandoned before external publication.
- **Decision owner:** Aaron.
- **Actions:** For uncommitted runbook/evidence-only changes, restore only the specific changed documentation file to the verified qualified source commit. Do not reset the repository, rewrite history, delete unrelated files, or modify ACCQ-003 implementation files as rollback.
- **External publication limit:** After a commit has been pushed, do not force-push or rewrite history. Correct the record with a new explicit follow-up commit and, if needed, a corresponding append-only Drive correction.
- **Drive rollback:** Do not delete historical rows. If a Drive receipt is wrong, append a dated correction that identifies the superseded receipt and preserves history.
- **Verification:** Re-run repository target inspection, confirm intended files only, then re-run the focused 25-test qualification if any executable source file changed.
- **Limitations:** This rollback covers documentation/evidence publication only. It does not authorize source rollback, branch deletion, force-push, destructive reset, or canon changes.

## Completion criteria

- [ ] Repository target identity is verified and recorded.
- [ ] Exactly one added clock family remains STEWARDSHIP_MEMORY.
- [ ] B-HIST-001 → B-HIST-002 provenance is preserved.
- [ ] Exact cadence remains HOLD.
- [ ] ACCQ-002 source simulation hash remains unchanged.
- [ ] Focused qualification reports 25/25 PASS.
- [ ] Full deterministic suite reports 34 test files / 638 tests / 638 PASS.
- [ ] Typecheck PASS.
- [ ] Production build PASS.
- [ ] GamerLaStone Aperture Trial 001 evidence remains unchanged.
- [ ] Qualification receipt is source-bounded and non-canon.
- [ ] Any Drive receipt has been read back successfully.
- [ ] Any pushed Git commit has been verified remotely.

## Communications

- **Start:** Owner is informed that ACCQ-003 reproduction/verification has begun against the named branch and commit.
- **Failure:** Report the exact failed phase, command/check, observed output, preserved evidence, and whether any external write occurred. Do not characterize a partial run as PASS.
- **Completion:** Report branch, commit, test totals, cadence HOLD, Drive receipt status, and any unresolved assumptions. No private contact data is embedded in this runbook.

## Record

- **Started:** Record at execution time.
- **Completed:** Record at execution time.
- **Operator:** Record the executing human or authorized agent.
- **Approvals:** Record owner authorization for Drive writes and Git push when those actions are performed.
- **Outcome:** PASS, NOT QUALIFIED, or STOPPED.
- **Deviations:** Record any command, target, count, or environment difference from this runbook.
- **Follow-up:** A future second clock-family experiment requires a new bounded qualification and must not reuse ACCQ-003 PASS as blanket authorization.
- **Next verification:** Re-run target inspection and qualification before any later source-changing execution or if the branch advances.
