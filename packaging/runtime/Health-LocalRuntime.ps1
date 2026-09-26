param([int]$Port = 24701)
$ErrorActionPreference='Stop'
$health = Invoke-RestMethod -Uri ("http://127.0.0.1:{0}/health" -f $Port) -TimeoutSec 3
if($health.status -ne 'ok' -or $health.adapterId -ne 'LOCAL-RUNTIME-ADAPTER-001' -or $health.host -ne '127.0.0.1'){
  throw 'Unexpected local runtime identity.'
}
$baseline = Invoke-RestMethod -Uri ("http://127.0.0.1:{0}/gp-test-001/baseline" -f $Port) -TimeoutSec 3
[pscustomobject]@{
  status=$health.status
  adapterId=$health.adapterId
  qualifiedBaseCommit=$health.qualifiedBaseCommit
  fixtureId=$baseline.fixtureId
  baselineHash=$baseline.hash
  totalWater=$baseline.totalWater
  port=$Port
} | ConvertTo-Json -Compress
