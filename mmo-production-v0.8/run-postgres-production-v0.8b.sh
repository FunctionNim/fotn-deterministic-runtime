#!/usr/bin/env bash
set -euo pipefail
set -x

ROOT="${GITHUB_WORKSPACE:-$(pwd)}"
LAB=/tmp/fotn-lab
REPORTS="$LAB/reports"
CERTS=/tmp/pgcerts
RUN_ID="${GITHUB_RUN_ID:-local}"
MAIN_STREAM="prod:blue:v0.8:${RUN_ID}"
EXPECTED_BLUE_HASH='e3cede0e0bd1a9d84738f06f079a6e7756f785142ee93bcfe0acfca4bf25a4c4'
EXPECTED_DIGEST='fd941724c74dcdd28319432f479e8be96377fd304ed7cd22d18bd0551ff6a63f'

cleanup() {
  docker rm -f pg-primary pg-standby pg-rejoin pg-restored >/dev/null 2>&1 || true
  docker network rm fotn-pg >/dev/null 2>&1 || true
}
trap cleanup EXIT

wait_pg() {
  local name="$1"
  for i in $(seq 1 60); do
    if docker exec "$name" pg_isready -U postgres >/dev/null 2>&1; then return 0; fi
    sleep 2
  done
  docker logs "$name" || true
  return 1
}

restore_lab() {
  rm -rf "$LAB" /tmp/fotn-lab.zip
  mkdir -p "$LAB" "$REPORTS"
  : > /tmp/fotn-lab.zip
  for f in "$ROOT"/mmo-hearing-payload-v2/part*.b64; do base64 --decode "$f" >> /tmp/fotn-lab.zip; done
  echo 'aa535a41683096d9bf5056b4ab7502da7821a23b811ff6871e3b4531f6710919  /tmp/fotn-lab.zip' | sha256sum -c -
  unzip -q /tmp/fotn-lab.zip -d "$LAB"
  mkdir -p "$REPORTS"
  cp "$ROOT/mmo-scale-v0.7/scale-blue-fixture.mjs" "$LAB/scripts/"
  cp "$ROOT/mmo-production-v0.8/run-postgres-production-v0.8.mjs" "$LAB/scripts/"
  (cd "$LAB" && npm install --no-save pg@8 && npm run all)
}

generate_tls() {
  docker pull postgres:18.4
  local uid gid
  uid=$(docker run --rm postgres:18.4 id -u postgres)
  gid=$(docker run --rm postgres:18.4 id -g postgres)
  sudo rm -rf "$CERTS" && sudo mkdir -p "$CERTS" && sudo chown "$(id -u):$(id -g)" "$CERTS"
  openssl req -x509 -newkey rsa:2048 -nodes -days 2 -subj '/CN=FOTN-PG-CA' -keyout "$CERTS/ca.key" -out "$CERTS/ca.crt"
  openssl req -newkey rsa:2048 -nodes -subj '/CN=localhost' -keyout "$CERTS/server.key" -out "$CERTS/server.csr"
  cat >"$CERTS/server.ext" <<'EXT'
subjectAltName=DNS:localhost,DNS:pg-primary,DNS:pg-standby,DNS:pg-rejoin,DNS:pg-restored,IP:127.0.0.1
extendedKeyUsage=serverAuth
EXT
  openssl x509 -req -days 2 -in "$CERTS/server.csr" -CA "$CERTS/ca.crt" -CAkey "$CERTS/ca.key" -CAcreateserial -extfile "$CERTS/server.ext" -out "$CERTS/server.crt"
  sudo chown "$uid:$gid" "$CERTS/server.key"
  sudo chmod 600 "$CERTS/server.key"
  chmod 644 "$CERTS/server.crt" "$CERTS/ca.crt"
}

start_primary() {
  docker network create fotn-pg
  docker volume create pg-primary-data
  docker run -d --name pg-primary --network fotn-pg -p 5432:5432 \
    -e POSTGRES_PASSWORD=admin-pass -e PGDATA=/var/lib/postgresql/data \
    -v pg-primary-data:/var/lib/postgresql -v "$CERTS:/certs:ro" \
    postgres:18.4 -c listen_addresses='*' -c ssl=on -c ssl_cert_file=/certs/server.crt -c ssl_key_file=/certs/server.key \
    -c wal_level=replica -c max_wal_senders=10 -c hot_standby=on
  wait_pg pg-primary
  docker exec pg-primary bash -lc 'cat > "$PGDATA/pg_hba.conf" <<"HBA"
local all all trust
hostssl replication replicator 0.0.0.0/0 scram-sha-256
hostssl all all 0.0.0.0/0 scram-sha-256
host all all 0.0.0.0/0 reject
HBA'
  docker exec pg-primary psql -U postgres -v ON_ERROR_STOP=1 -c 'select pg_reload_conf();'
  docker exec pg-primary psql -U postgres -v ON_ERROR_STOP=1 -c "create role replicator with replication login password 'repl-pass';"
  docker exec pg-primary psql -U postgres -v ON_ERROR_STOP=1 -c "create role fotn_app login password 'fotn-app-pass' nosuperuser nocreatedb nocreaterole noreplication;"
  docker exec -i pg-primary psql -U postgres -v ON_ERROR_STOP=1 < "$LAB/adapters/postgres-event-store-v0.3.sql"
  docker exec -i pg-primary psql -U postgres -v ON_ERROR_STOP=1 <<'SQL'
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO fotn_app;
GRANT SELECT,INSERT,UPDATE,DELETE ON mmo_event_streams,mmo_event_stream_events,mmo_event_stream_snapshots,mmo_projection_checkpoints TO fotn_app;
CREATE TABLE IF NOT EXISTS mmo_projection_stream_counts(stream_id text PRIMARY KEY,event_count bigint NOT NULL,last_revision bigint NOT NULL,rebuilt_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT,UPDATE,DELETE ON mmo_projection_stream_counts TO fotn_app;
SQL
}

basebackup_to_volume() {
  local source="$1" volume="$2" appname="$3"
  docker volume create "$volume"
  docker run --rm --network fotn-pg -e PGPASSWORD=repl-pass \
    -v "$volume:/var/lib/postgresql" -v "$CERTS:/certs:ro" postgres:18.4 bash -lc "
      install -d -o postgres -g postgres -m 700 /var/lib/postgresql/data
      gosu postgres pg_basebackup -d 'host=$source port=5432 user=replicator sslmode=verify-full sslrootcert=/certs/ca.crt' -D /var/lib/postgresql/data -Fp -Xs -P
      touch /var/lib/postgresql/data/standby.signal
      printf '%s\n' \"primary_conninfo = 'host=$source port=5432 user=replicator password=repl-pass application_name=$appname sslmode=verify-full sslrootcert=/certs/ca.crt'\" >> /var/lib/postgresql/data/postgresql.auto.conf
    "
}

start_standby() {
  local name="$1" volume="$2" port="$3"
  docker run -d --name "$name" --network fotn-pg -p "$port:5432" \
    -e PGDATA=/var/lib/postgresql/data -v "$volume:/var/lib/postgresql" -v "$CERTS:/certs:ro" \
    postgres:18.4 -c listen_addresses='*' -c ssl=on -c ssl_cert_file=/certs/server.crt -c ssl_key_file=/certs/server.key -c hot_standby=on
  wait_pg "$name"
}

wait_sync() {
  local primary="$1" app="$2"
  for i in $(seq 1 60); do
    local row
    row=$(docker exec "$primary" psql -At -U postgres -c "select state||':'||sync_state from pg_stat_replication where application_name='$app';" || true)
    echo "$row"
    if [[ "$row" == 'streaming:sync' ]]; then return 0; fi
    sleep 2
  done
  docker exec "$primary" psql -x -U postgres -c 'select * from pg_stat_replication;' || true
  return 1
}

run_node() {
  local host="$1" port="$2" mode="$3" report="$4" label="${5:-}"
  (cd "$LAB" && \
    PGHOST="$host" PGPORT="$port" PGUSER=fotn_app PGPASSWORD=fotn-app-pass PGDATABASE=postgres PGSSLROOTCERT="$CERTS/ca.crt" \
    FOTN_PROD_TAIL_COUNT=1000 FOTN_STREAM_ID="$MAIN_STREAM" FOTN_REPORT_FILE="$REPORTS/$report" FOTN_PROBE_LABEL="$label" \
    node scripts/run-postgres-production-v0.8.mjs "$mode")
}

restore_lab
generate_tls
start_primary
basebackup_to_volume pg-primary pg-standby-data pg-standby
start_standby pg-standby pg-standby-data 5433

docker exec pg-primary psql -U postgres -v ON_ERROR_STOP=1 -c "alter system set synchronous_standby_names='FIRST 1 (pg-standby)';"
docker exec pg-primary psql -U postgres -v ON_ERROR_STOP=1 -c "alter system set synchronous_commit='remote_apply';"
docker exec pg-primary psql -U postgres -v ON_ERROR_STOP=1 -c 'select pg_reload_conf();'
wait_sync pg-primary pg-standby

run_node 127.0.0.1 5432 write pg-primary-write.json
run_node 127.0.0.1 5432 evolve pg-evolution.json
docker exec pg-primary psql -At -U postgres -c "select json_build_object('replication',(select coalesce(json_agg(row_to_json(r)),'[]'::json) from (select application_name,state,sync_state,write_lsn,flush_lsn,replay_lsn from pg_stat_replication) r),'wal',(select row_to_json(w) from (select wal_records,wal_fpi,wal_bytes from pg_stat_wal) w));" > "$REPORTS/pg-observability-before-failover.json"

docker stop pg-primary
docker network disconnect fotn-pg pg-primary || true
docker exec -u postgres pg-standby pg_ctl -D /var/lib/postgresql/data promote -w
for i in $(seq 1 30); do [[ "$(docker exec pg-standby psql -At -U postgres -c 'select pg_is_in_recovery();')" == 'f' ]] && break; sleep 2; done
run_node 127.0.0.1 5433 verify pg-after-failover.json
run_node 127.0.0.1 5433 probe pg-failover-probe.json failover
echo '{"oldPrimary":"STOPPED_AND_NETWORK_DISCONNECTED","policy":"explicit fencing before rebuild"}' > "$REPORTS/pg-old-primary-fence.json"

docker rm pg-primary
docker volume rm pg-primary-data
basebackup_to_volume pg-standby pg-rejoin-data pg-rejoin
start_standby pg-rejoin pg-rejoin-data 5434
docker exec pg-standby psql -U postgres -v ON_ERROR_STOP=1 -c "alter system set synchronous_standby_names='FIRST 1 (pg-rejoin)';"
docker exec pg-standby psql -U postgres -v ON_ERROR_STOP=1 -c "alter system set synchronous_commit='remote_apply';"
docker exec pg-standby psql -U postgres -v ON_ERROR_STOP=1 -c 'select pg_reload_conf();'
wait_sync pg-standby pg-rejoin
run_node 127.0.0.1 5433 probe pg-rejoin-probe.json rejoin
[[ "$(docker exec pg-rejoin psql -At -U postgres -c "select count(*) from mmo_event_stream_events where stream_id='prod:probe:rejoin:${RUN_ID}';")" == '1' ]]

docker exec pg-standby psql -U postgres -v ON_ERROR_STOP=1 -c "alter system reset synchronous_standby_names;"
docker exec pg-standby psql -U postgres -v ON_ERROR_STOP=1 -c "alter system set synchronous_commit='on';"
docker exec pg-standby psql -U postgres -v ON_ERROR_STOP=1 -c 'select pg_reload_conf();'

docker volume create pg-restore-data
start_ms=$(date +%s%3N)
docker run --rm --network fotn-pg -e PGPASSWORD=repl-pass -v pg-restore-data:/var/lib/postgresql -v "$CERTS:/certs:ro" postgres:18.4 bash -lc "
  install -d -o postgres -g postgres -m 700 /var/lib/postgresql/data
  gosu postgres pg_basebackup -d 'host=pg-standby port=5432 user=replicator sslmode=verify-full sslrootcert=/certs/ca.crt' -D /var/lib/postgresql/data -Fp -Xs -P
"
end_ms=$(date +%s%3N); echo $((end_ms-start_ms)) > "$REPORTS/pg-backup-duration-ms.txt"

docker rm -f pg-standby pg-rejoin
docker volume rm pg-standby-data pg-rejoin-data
start_ms=$(date +%s%3N)
docker run -d --name pg-restored --network fotn-pg -p 5435:5432 \
  -e PGDATA=/var/lib/postgresql/data -v pg-restore-data:/var/lib/postgresql -v "$CERTS:/certs:ro" \
  postgres:18.4 -c listen_addresses='*' -c ssl=on -c ssl_cert_file=/certs/server.crt -c ssl_key_file=/certs/server.key -c synchronous_standby_names='' -c synchronous_commit=on
wait_pg pg-restored
end_ms=$(date +%s%3N); echo $((end_ms-start_ms)) > "$REPORTS/pg-restore-start-duration-ms.txt"

run_node 127.0.0.1 5435 verify pg-after-restore.json
[[ "$(docker exec pg-restored psql -At -U postgres -c "select count(*) from mmo_event_stream_events where stream_id='prod:probe:failover:${RUN_ID}';")" == '1' ]]
[[ "$(docker exec pg-restored psql -At -U postgres -c "select count(*) from mmo_event_stream_events where stream_id='prod:probe:rejoin:${RUN_ID}';")" == '1' ]]
[[ "$(docker exec pg-restored psql -At -U postgres -c "select state_data->>'schemaVersion' from mmo_event_stream_snapshots where stream_id='${MAIN_STREAM}';")" == '2' ]]
[[ "$(docker exec pg-restored psql -At -U postgres -c "select event_count from mmo_projection_stream_counts where stream_id='${MAIN_STREAM}';")" == '1012' ]]
docker exec pg-restored psql -At -U postgres -c "select json_build_object('ssl',(select count(*) from pg_stat_ssl where ssl),'database',(select row_to_json(d) from (select numbackends,xact_commit,blks_read,blks_hit from pg_stat_database where datname='postgres') d),'wal',(select row_to_json(w) from (select wal_records,wal_fpi,wal_bytes from pg_stat_wal) w));" > "$REPORTS/pg-observability-after-restore.json"

python - <<PY
import json,pathlib
r=pathlib.Path('$REPORTS')
before=json.loads((r/'pg-primary-write.json').read_text()); fail=json.loads((r/'pg-after-failover.json').read_text()); restore=json.loads((r/'pg-after-restore.json').read_text())
assert before['result']['baseBlueFinalHash']==fail['result']['baseBlueFinalHash']==restore['result']['baseBlueFinalHash']=='$EXPECTED_BLUE_HASH'
assert before['result']['finalDigest']==fail['result']['finalDigest']==restore['result']['finalDigest']=='$EXPECTED_DIGEST'
out={'status':'PASS_POSTGRESQL_PRODUCTION_PROMOTION_HARNESS_001_TECHNICAL_GATES','database':'PostgreSQL 18.4','checks':{'tlsVerifiedByPrivateCA':True,'leastPrivilegeApplicationRole':True,'primaryStandbyStreaming':True,'synchronousRemoteApply':True,'forcedFailover':True,'oldPrimaryFenced':True,'oldPrimaryRebuiltAsStandby':True,'postRejoinReplication':True,'destructiveBaseBackupRestore':True,'blueCanonicalHashRecovered':True,'scaleDigestRecovered':True,'metadataEvolutionCompatible':True,'snapshotMigrationV2':True,'projectionRebuild':True,'observabilityEvidenceCaptured':True},'baseBlueFinalHash':restore['result']['baseBlueFinalHash'],'finalDigest1000Tail':restore['result']['finalDigest'],'backupDurationMs':int((r/'pg-backup-duration-ms.txt').read_text()),'restoreStartDurationMs':int((r/'pg-restore-start-duration-ms.txt').read_text()),'promotion':'HOLD_PRODUCTION_AUTHORITY_COST_MAINTENANCE_GATE_NOT_MEASURED','boundary':'Technical HA/recovery/security/evolution gates passed on ephemeral GitHub-hosted Docker infrastructure. This is not representative production cost or long-duration operations evidence.'}
(r/'postgres-production-promotion-v0.8.json').write_text(json.dumps(out,indent=2)); print(json.dumps(out,indent=2))
PY
