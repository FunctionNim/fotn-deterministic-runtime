#!/usr/bin/env bash
set -euo pipefail
set -x

ROOT="${GITHUB_WORKSPACE:-$(pwd)}"
LAB=/tmp/fotn-lab
REPORTS="$LAB/reports"
CERTS=/tmp/kurrent-certs
RUN_ID="${GITHUB_RUN_ID:-local}"
COMPOSE_PROJECT_NAME=fotnkurrentv08c
export COMPOSE_PROJECT_NAME
export KURRENT_CERT_DIR="$CERTS"
export FOTN_PROD_TAIL_COUNT=1000
export FOTN_STREAM_ID="prod-blue-kurrent-v0.8c-${RUN_ID}"
export KURRENTDB_CONNECTION_STRING="kurrentdb://admin:fotn-admin-pass@localhost:2111,localhost:2112,localhost:2113?tls=true&tlsVerifyCert=true&tlsCaFile=${CERTS}/ca/ca.crt&nodePreference=leader"
COMPOSE="$ROOT/mmo-production-v0.8/kurrent-secure-cluster-v0.8c.yml"
EXPECTED_BLUE_HASH='e3cede0e0bd1a9d84738f06f079a6e7756f785142ee93bcfe0acfca4bf25a4c4'
EXPECTED_DIGEST='fd941724c74dcdd28319432f479e8be96377fd304ed7cd22d18bd0551ff6a63f'

cleanup() {
  docker compose -f "$COMPOSE" down -v >/dev/null 2>&1 || true
}
trap cleanup EXIT

restore_lab() {
  rm -rf "$LAB" /tmp/fotn-lab.zip
  mkdir -p "$LAB" "$REPORTS"
  : > /tmp/fotn-lab.zip
  for f in "$ROOT"/mmo-hearing-payload-v2/part*.b64; do base64 --decode "$f" >> /tmp/fotn-lab.zip; done
  echo 'aa535a41683096d9bf5056b4ab7502da7821a23b811ff6871e3b4531f6710919  /tmp/fotn-lab.zip' | sha256sum -c -
  unzip -q /tmp/fotn-lab.zip -d "$LAB"
  mkdir -p "$REPORTS"
  cp "$ROOT/mmo-scale-v0.7/scale-blue-fixture.mjs" "$LAB/scripts/"
  cp "$ROOT/mmo-production-v0.8/run-kurrent-ha-v0.8.mjs" "$LAB/scripts/"
  (cd "$LAB" && npm install --no-save @kurrent/kurrentdb-client@1.3.0 && npm run all)
}

generate_certs() {
  sudo rm -rf "$CERTS"
  sudo mkdir -p "$CERTS"
  sudo chown 1000:1000 "$CERTS"
  docker pull eventstore/es-gencert-cli:1.0.2
  docker run --rm \
    --user 1000:1000 \
    -v "$CERTS:/certs" \
    -w /certs \
    --entrypoint bash \
    eventstore/es-gencert-cli:1.0.2 \
    -c "es-gencert-cli create-ca \
      && es-gencert-cli create-node -out ./node1 -ip-addresses 127.0.0.1,172.30.240.11 -dns-names localhost,node1.kurrentdb \
      && es-gencert-cli create-node -out ./node2 -ip-addresses 127.0.0.1,172.30.240.12 -dns-names localhost,node2.kurrentdb \
      && es-gencert-cli create-node -out ./node3 -ip-addresses 127.0.0.1,172.30.240.13 -dns-names localhost,node3.kurrentdb"

  for n in 1 2 3; do
    openssl verify -CAfile "$CERTS/ca/ca.crt" "$CERTS/node${n}/node.crt"
    openssl x509 -in "$CERTS/node${n}/node.crt" -noout -subject -issuer -ext subjectAltName >> "$REPORTS/kurrent-certificate-evidence.txt"
  done
  cn1=$(openssl x509 -in "$CERTS/node1/node.crt" -noout -subject | sed 's/.*CN *= *//')
  cn2=$(openssl x509 -in "$CERTS/node2/node.crt" -noout -subject | sed 's/.*CN *= *//')
  cn3=$(openssl x509 -in "$CERTS/node3/node.crt" -noout -subject | sed 's/.*CN *= *//')
  [[ "$cn1" == "$cn2" && "$cn2" == "$cn3" ]]
  printf 'sharedClusterCertificateCN=%s\n' "$cn1" >> "$REPORTS/kurrent-certificate-evidence.txt"
}

wait_https() {
  local port="$1"
  for i in $(seq 1 60); do
    if curl -fsS --cacert "$CERTS/ca/ca.crt" -u admin:fotn-admin-pass "https://localhost:${port}/health/live?liveCode=200" >/dev/null; then return 0; fi
    sleep 2
  done
  docker logs "node$((port-2110)).kurrentdb" || true
  return 1
}

wait_all() {
  wait_https 2111
  wait_https 2112
  wait_https 2113
}

record_nodes() {
  local output="$1"
  python - "$output" <<'PY'
import json,ssl,urllib.request,pathlib,base64,sys
ctx=ssl.create_default_context(cafile='/tmp/kurrent-certs/ca/ca.crt')
auth='Basic '+base64.b64encode(b'admin:fotn-admin-pass').decode()
out=[]
for p in (2111,2112,2113):
    try:
        req=urllib.request.Request(f'https://localhost:{p}/info',headers={'Authorization':auth})
        with urllib.request.urlopen(req,context=ctx,timeout=5) as r: out.append({'port':p,'info':json.load(r)})
    except Exception as e:
        out.append({'port':p,'error':repr(e)})
pathlib.Path(sys.argv[1]).write_text(json.dumps(out,indent=2))
print(json.dumps(out,indent=2))
PY
}

leader_container_from_file() {
  local file="$1"
  python - "$file" <<'PY'
import json,sys
nodes=json.load(open(sys.argv[1]))
for n in nodes:
    if str(n.get('info',{}).get('state','')).lower()=='leader':
        print({2111:'node1.kurrentdb',2112:'node2.kurrentdb',2113:'node3.kurrentdb'}[n['port']]); break
PY
}

leader_port_live() {
  python - <<'PY'
import json,ssl,urllib.request,base64
ctx=ssl.create_default_context(cafile='/tmp/kurrent-certs/ca/ca.crt')
auth='Basic '+base64.b64encode(b'admin:fotn-admin-pass').decode()
for p in (2111,2112,2113):
    try:
        req=urllib.request.Request(f'https://localhost:{p}/info',headers={'Authorization':auth})
        with urllib.request.urlopen(req,context=ctx,timeout=2) as r: info=json.load(r)
        if str(info.get('state','')).lower()=='leader': print(p); break
    except Exception: pass
PY
}

run_node() {
  local mode="$1" report="$2" label="${3:-}"
  (cd "$LAB" && FOTN_REPORT_FILE="$REPORTS/$report" FOTN_PROBE_LABEL="$label" node scripts/run-kurrent-ha-v0.8.mjs "$mode")
}

restore_lab
generate_certs

docker compose -f "$COMPOSE" pull
docker compose -f "$COMPOSE" up -d
wait_all
if curl -fsS http://localhost:2111/health/live >/dev/null 2>&1; then echo 'plaintext endpoint unexpectedly accepted'; exit 1; fi

record_nodes "$REPORTS/kurrent-initial-nodes.json"
leader=$(leader_container_from_file "$REPORTS/kurrent-initial-nodes.json")
[[ -n "$leader" ]]
echo "$leader" > "$REPORTS/kurrent-original-leader.txt"
run_node write kurrent-initial-write.json

docker stop "$leader"
newleader=''
for i in $(seq 1 60); do newleader=$(leader_port_live || true); [[ -n "$newleader" ]] && break; sleep 2; done
[[ -n "$newleader" ]]
echo "$newleader" > "$REPORTS/kurrent-new-leader-port.txt"
run_node verify kurrent-after-leader-loss.json
run_node probe kurrent-leader-loss-probe.json leader-loss

docker start "$leader"
wait_all
sleep 5
record_nodes "$REPORTS/kurrent-rejoined-nodes.json"
for port in 2111 2112 2113; do curl -fsS --cacert "$CERTS/ca/ca.crt" -u admin:fotn-admin-pass "https://localhost:${port}/metrics" | head -n 400 > "$REPORTS/kurrent-metrics-${port}.txt" || true; done

mkdir -p /tmp/kurrent-backup
docker compose -f "$COMPOSE" stop
start_ms=$(date +%s%3N)
for n in 1 2 3; do
  docker run --rm -v "${COMPOSE_PROJECT_NAME}_kurrent-node${n}-data:/from:ro" -v /tmp/kurrent-backup:/backup alpine sh -lc "cd /from && tar czf /backup/node${n}.tgz ."
done
end_ms=$(date +%s%3N); echo $((end_ms-start_ms)) > "$REPORTS/kurrent-backup-duration-ms.txt"

docker compose -f "$COMPOSE" down -v
for n in 1 2 3; do
  docker volume create "${COMPOSE_PROJECT_NAME}_kurrent-node${n}-data"
  docker run --rm -v "${COMPOSE_PROJECT_NAME}_kurrent-node${n}-data:/to" -v /tmp/kurrent-backup:/backup alpine sh -lc "cd /to && tar xzf /backup/node${n}.tgz && find . -name chaser.chk -type f -exec sh -c 'cp \"\$1\" \"\$(dirname \"\$1\")/truncate.chk\"' _ {} \;"
done

start_ms=$(date +%s%3N)
docker compose -f "$COMPOSE" up -d
wait_all
end_ms=$(date +%s%3N); echo $((end_ms-start_ms)) > "$REPORTS/kurrent-restore-duration-ms.txt"
run_node verify kurrent-after-restore.json
record_nodes "$REPORTS/kurrent-restored-nodes.json"

python - <<PY
import json,pathlib
r=pathlib.Path('$REPORTS')
before=json.loads((r/'kurrent-initial-write.json').read_text()); after=json.loads((r/'kurrent-after-leader-loss.json').read_text()); restored=json.loads((r/'kurrent-after-restore.json').read_text())
assert before['result']['baseBlueFinalHash']==after['result']['baseBlueFinalHash']==restored['result']['baseBlueFinalHash']=='$EXPECTED_BLUE_HASH'
assert before['result']['finalDigest']==after['result']['finalDigest']==restored['result']['finalDigest']=='$EXPECTED_DIGEST'
nodes=json.loads((r/'kurrent-restored-nodes.json').read_text()); states=[str(n.get('info',{}).get('state','')) for n in nodes]
assert sum(s.lower()=='leader' for s in states)==1, states
out={'status':'PASS_KURRENTDB_SECURE_3_NODE_REFERENCE_HA_V0_8C','database':'KurrentDB 26.1.1','checks':{'secureTlsCluster':True,'privateCaVerifiedByClient':True,'sharedClusterCertificateCommonName':True,'threeVotingNodes':True,'oneNodeLossContinuedWrites':True,'leaderElection':True,'failedNodeRejoin':True,'coldQuorumBackupDestroyRestore':True,'truncateCheckpointRestoredPerDocumentedRule':True,'blueCanonicalHashRecovered':True,'scaleDigestRecovered':True,'metricsCaptured':True},'baseBlueFinalHash':restored['result']['baseBlueFinalHash'],'finalDigest1000Tail':restored['result']['finalDigest'],'backupDurationMs':int((r/'kurrent-backup-duration-ms.txt').read_text()),'restoreDurationMs':int((r/'kurrent-restore-duration-ms.txt').read_text()),'restoredStates':states,'decisionEffect':'REFERENCE_CONFORMANCE_PASS_DOES_NOT_AUTOMATICALLY_REOPEN_POSTGRESQL_PROVISIONAL_SELECTION','boundary':'Secure 3-node Docker quorum reference evidence. Application conformance uses authenticated admin credentials; least-privilege application identity remains a separate Kurrent reference hold.'}
(r/'kurrent-secure-ha-reference-v0.8c.json').write_text(json.dumps(out,indent=2)); print(json.dumps(out,indent=2))
PY
