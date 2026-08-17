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

cert_needle = '''restore_lab
generate_certs

docker compose -f "$COMPOSE" pull'''
cert_replacement = '''restore_lab
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
if cert_needle not in s:
    raise SystemExit('v0.8e certificate patch anchor not found; refusing semantic drift')
s = s.replace(cert_needle, cert_replacement, 1)

restore_needle = '''  docker run --rm -v "${COMPOSE_PROJECT_NAME}_kurrent-node${n}-data:/data" -v "$BACKUP:/backup:ro" alpine:3.21 \\
    sh -lc "cd /data && tar xzf /backup/node${n}.tgz"
done

docker compose -f "$COMPOSE" up -d
wait_all'''
restore_replacement = '''  docker run --rm -v "${COMPOSE_PROJECT_NAME}_kurrent-node${n}-data:/data" -v "$BACKUP:/backup:ro" alpine:3.21 \\
    sh -lc "set -eu; cd /data; tar xzf /backup/node${n}.tgz; chaser=\\$(find . -type f -name chaser.chk -print -quit); test -n \\"\\$chaser\\"; truncate=\\$(dirname \\"\\$chaser\\")/truncate.chk; cp -f \\"\\$chaser\\" \\"\\$truncate\\"; cmp -s \\"\\$chaser\\" \\"\\$truncate\\"; sync"
done

# v0.8e RESTORE/START-READINESS-ONLY PATCH.
# The first secure v0.8e attempt reached backup/destroy/restore but node3 did
# not become ready. KurrentDB's documented file-copy restore procedure requires
# restored truncate.chk to be overwritten from chaser.chk before restart.
# No HA assertion, topology, fixture, write/read predicate, or replay predicate
# is changed here.
{
  echo "restoreStartReadinessPatch=v0.8e-copy-chaser-checkpoint-to-truncate-before-restart"
  echo "certificateBoundaryPatchUnchanged=true"
  echo "clusterTopologyChanged=false"
  echo "haSemanticAssertionsChanged=false"
  echo "restoreSource=per-node-offline-file-copy-already-present-in-v0.8c"
  echo "checkpointRule=each-restored-node-chaser.chk-copied-over-sibling-truncate.chk"
} >> "$REPORTS/kurrent-v0.8e-restore-start-boundary.txt"

docker compose -f "$COMPOSE" up -d
if ! wait_all; then
  {
    echo "restoreReadiness=FAIL"
    echo "composePs:"
    docker compose -f "$COMPOSE" ps -a || true
    echo "composeLogs:"
    docker compose -f "$COMPOSE" logs --no-color || true
  } > "$REPORTS/kurrent-v0.8e-restore-start-failure-diagnostic.txt" 2>&1
  exit 7
fi
{
  echo "restoreReadiness=PASS"
  docker compose -f "$COMPOSE" ps -a
} >> "$REPORTS/kurrent-v0.8e-restore-start-boundary.txt" 2>&1'''
if restore_needle not in s:
    raise SystemExit('v0.8e restore patch anchor not found; refusing semantic drift')
s = s.replace(restore_needle, restore_replacement, 1)

if s.count('certificateBoundaryPatch=v0.8e') != 1:
    raise SystemExit('v0.8e certificate patch insertion count invalid')
if s.count('restoreStartReadinessPatch=v0.8e-copy-chaser-checkpoint-to-truncate-before-restart') != 1:
    raise SystemExit('v0.8e restore patch insertion count invalid')
p.write_text(s)
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
    'status': 'PASS_KURRENTDB_SECURE_3_NODE_REFERENCE_HA_V0_8E_CERT_AND_RESTORE_BOUNDARIES' if rc == 0 else 'HOLD_KURRENTDB_SECURE_3_NODE_REFERENCE_HA_V0_8E',
    'sourceQualificationScript': 'mmo-production-v0.8/run-kurrent-ha-v0.8c.sh',
    'certificateBoundaryPatch': 'chmod 0644 on generated node1/node2/node3 node.key after generation and before Docker Compose startup',
    'restoreStartReadinessPatch': 'after offline file-copy extraction, locate each node chaser.chk and copy it over sibling truncate.chk before KurrentDB restart, then require readiness on all three nodes',
    'restorePatchAuthority': 'KurrentDB documented simple file-copy restore procedure: after copying restored files, copy chaser.chk to truncate.chk before restart',
    'certificateMount': 'read-only bind mount /certs:ro (unchanged)',
    'certificateBoundaryPatchUnchanged': True,
    'haSemanticAssertionsChanged': False,
    'clusterTopologyChanged': False,
    'sourceExitCode': rc,
    'githubRunId': os.environ.get('GITHUB_RUN_ID', 'local'),
    'githubRunAttempt': os.environ.get('GITHUB_RUN_ATTEMPT', 'local'),
    'githubSha': os.environ.get('GITHUB_SHA', 'local'),
    'sourceResult': source,
    'decisionEffect': 'EVIDENCE_ONLY_NO_AUTOMATIC_PERSISTENCE_PROMOTION',
    'boundary': 'Disposable hosted secure three-node reference test. v0.8e repairs certificate-file readability and the documented restore checkpoint boundary only; production secret storage, least-privilege application identity, and all other production-promotion gates remain separate.'
}
out.write_text(json.dumps(payload, indent=2) + '\n')
print(json.dumps(payload, indent=2))
PY

exit "$rc"
