#!/usr/bin/env bash
set -uo pipefail

ROOT="${GITHUB_WORKSPACE:-$(pwd)}"
SOURCE="$ROOT/mmo-production-v0.8/run-kurrent-ha-v0.8c.sh"
PATCHED=/tmp/run-kurrent-ha-v0.8e-patched.sh
REPORTS=/tmp/fotn-lab/reports

cp "$SOURCE" "$PATCHED"

python - "$PATCHED" <<'PY'
from pathlib import Path
import sys
p = Path(sys.argv[1])
s = p.read_text()
needle = '''restore_lab
generate_certs

docker compose -f "$COMPOSE" pull'''
replacement = '''restore_lab
generate_certs

# v0.8e CERTIFICATE-BOUNDARY-ONLY PATCH.
# v0.8d proved that KurrentDB could read node.crt but was denied node.key.
# Preserve the v0.8c cluster topology and HA assertions unchanged; only make
# the three generated node private-key files readable through the read-only
# /certs bind mount. 0644 is narrower than KurrentDB's current Docker example,
# which relaxes generated certificate files to 0666 for its shared volume.
{
  echo "certificateBoundaryPatch=v0.8e"
  echo "before:"
  stat -c '%u:%g %a %n' "$CERTS"/node{1,2,3}/node.key
} >> "$REPORTS/kurrent-v0.8e-certificate-boundary.txt"
sudo chmod 0644 "$CERTS"/node{1,2,3}/node.key
{
  echo "after:"
  stat -c '%u:%g %a %n' "$CERTS"/node{1,2,3}/node.key
  echo "mountMode=read-only"
  echo "haSemanticAssertionsChanged=false"
} >> "$REPORTS/kurrent-v0.8e-certificate-boundary.txt"

docker compose -f "$COMPOSE" pull'''
if needle not in s:
    raise SystemExit('v0.8e patch anchor not found; refusing semantic drift')
s2 = s.replace(needle, replacement, 1)
if s2.count('certificateBoundaryPatch=v0.8e') != 1:
    raise SystemExit('v0.8e patch insertion count invalid')
p.write_text(s2)
PY
chmod +x "$PATCHED"

set +e
bash "$PATCHED"
rc=$?
set -e

mkdir -p "$REPORTS"
python - "$REPORTS/kurrent-v0.8e-boundary-and-ha.json" "$rc" <<'PY'
import json, os, pathlib, sys
out = pathlib.Path(sys.argv[1])
rc = int(sys.argv[2])
source_report = out.parent / 'kurrent-secure-ha-reference-v0.8c.json'
source = None
if source_report.exists():
    source = json.loads(source_report.read_text())
payload = {
    'status': 'PASS_KURRENTDB_SECURE_3_NODE_REFERENCE_HA_V0_8E_CERT_BOUNDARY' if rc == 0 else 'HOLD_KURRENTDB_SECURE_3_NODE_REFERENCE_HA_V0_8E',
    'sourceQualificationScript': 'mmo-production-v0.8/run-kurrent-ha-v0.8c.sh',
    'certificateBoundaryPatch': 'chmod 0644 on generated node1/node2/node3 node.key after generation and before Docker Compose startup',
    'certificateMount': 'read-only bind mount /certs:ro (unchanged)',
    'haSemanticAssertionsChanged': False,
    'clusterTopologyChanged': False,
    'sourceExitCode': rc,
    'githubRunId': os.environ.get('GITHUB_RUN_ID', 'local'),
    'githubRunAttempt': os.environ.get('GITHUB_RUN_ATTEMPT', 'local'),
    'githubSha': os.environ.get('GITHUB_SHA', 'local'),
    'sourceResult': source,
    'decisionEffect': 'EVIDENCE_ONLY_NO_AUTOMATIC_PERSISTENCE_PROMOTION',
    'boundary': 'Disposable hosted secure three-node reference test. The v0.8e patch repairs only certificate-file readability; production secret storage and least-privilege application identity remain separate gates.'
}
out.write_text(json.dumps(payload, indent=2) + '\n')
print(json.dumps(payload, indent=2))
PY

exit "$rc"
