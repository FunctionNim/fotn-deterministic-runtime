#!/usr/bin/env bash
set -uo pipefail

ROOT="${GITHUB_WORKSPACE:-$(pwd)}"
ORIGINAL="$ROOT/mmo-production-v0.8/run-kurrent-ha-v0.8c.sh"
DIAG_ROOT=/tmp/fotn-kurrent-diagnostic-v0-8d
TRANSCRIPT="$DIAG_ROOT/v0.8c-full-transcript.redacted.log"
REPORTS=/tmp/fotn-lab/reports

rm -rf "$DIAG_ROOT"
mkdir -p "$DIAG_ROOT"

# Diagnostic witness only: execute the unchanged v0.8c qualification script and
# preserve its existing xtrace/stdout/stderr. Redact known laboratory credentials
# before persistence. This wrapper does not change cluster configuration or test semantics.
set +e
bash "$ORIGINAL" 2>&1 \
  | sed -u \
      -e 's/fotn-admin-pass/[REDACTED_ADMIN_PASSWORD]/g' \
      -e 's/fotn-ops-pass/[REDACTED_OPS_PASSWORD]/g' \
  | tee "$TRANSCRIPT"
rc=${PIPESTATUS[0]}
set -e

# The original script may have created or recreated /tmp/fotn-lab. Persist the
# transcript only after it exits so restore_lab cannot unlink the diagnostic copy.
mkdir -p "$REPORTS"
cp "$TRANSCRIPT" "$REPORTS/kurrent-v0.8d-diagnostic-transcript.redacted.log"
tail -n 500 "$TRANSCRIPT" > "$REPORTS/kurrent-v0.8d-diagnostic-tail.redacted.log"

python - "$REPORTS/kurrent-v0.8d-diagnostic-context.json" "$rc" <<'PY'
import json, os, pathlib, sys
out = pathlib.Path(sys.argv[1])
rc = int(sys.argv[2])
payload = {
    "status": "DIAGNOSTIC_WITNESS_ONLY",
    "sourceQualificationScript": "mmo-production-v0.8/run-kurrent-ha-v0.8c.sh",
    "sourceSemanticsChanged": False,
    "sourceExitCode": rc,
    "githubRunId": os.environ.get("GITHUB_RUN_ID", "local"),
    "githubRunAttempt": os.environ.get("GITHUB_RUN_ATTEMPT", "local"),
    "githubSha": os.environ.get("GITHUB_SHA", "local"),
    "purpose": "Preserve the first internal failure boundary before any repair or retry semantics change.",
    "credentialHandling": "Known laboratory passwords are redacted before transcript persistence."
}
out.write_text(json.dumps(payload, indent=2) + "\n")
print(json.dumps(payload, indent=2))
PY

exit "$rc"
