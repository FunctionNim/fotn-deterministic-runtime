#!/usr/bin/env bash
# v0.8c trigger marker: synchronous standby identifiers normalized to SQL-safe application names.
set -euo pipefail
ROOT="${GITHUB_WORKSPACE:-$(pwd)}"
TMP=/tmp/run-postgres-production-v0.8c.generated.sh
cp "$ROOT/mmo-production-v0.8/run-postgres-production-v0.8b.sh" "$TMP"
python - "$TMP" <<'PY'
from pathlib import Path
import sys
p=Path(sys.argv[1])
s=p.read_text()
repls={
"basebackup_to_volume pg-primary pg-standby-data pg-standby":"basebackup_to_volume pg-primary pg-standby-data pg_standby",
"synchronous_standby_names='FIRST 1 (pg-standby)'":"synchronous_standby_names='FIRST 1 (pg_standby)'",
"wait_sync pg-primary pg-standby":"wait_sync pg-primary pg_standby",
"basebackup_to_volume pg-standby pg-rejoin-data pg-rejoin":"basebackup_to_volume pg-standby pg-rejoin-data pg_rejoin",
"synchronous_standby_names='FIRST 1 (pg-rejoin)'":"synchronous_standby_names='FIRST 1 (pg_rejoin)'",
"wait_sync pg-standby pg-rejoin":"wait_sync pg-standby pg_rejoin",
}
for old,new in repls.items():
    if old not in s:
        raise SystemExit(f'EXPECTED_V0_8B_PATTERN_MISSING:{old}')
    s=s.replace(old,new)
p.write_text(s)
PY
exec bash "$TMP"
