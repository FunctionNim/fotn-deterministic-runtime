param(
  [string]$ParentRoot = (Join-Path $env:LOCALAPPDATA 'FOTN\LocalRuntimeAdapter'),
  [int]$Port = 24701
)
$ErrorActionPreference='Stop'
$Product='FOTN Local Runtime Adapter'
$ExpectedAdapter='LOCAL-RUNTIME-ADAPTER-001'
$HistoryWriter=Join-Path $PSScriptRoot 'Write-UpdateHistory.ps1'
if(!(Test-Path $HistoryWriter)){ throw "Update history helper missing: $HistoryWriter" }

function Read-Marker([string]$Root) {
  $path=Join-Path $Root 'FOTN_LOCAL_RUNTIME_INSTALL.json'
  if(!(Test-Path $path)){ throw "Installation marker missing: $Root" }
  $m=Get-Content $path -Raw | ConvertFrom-Json
  if($m.product -ne $Product){ throw "Unexpected product marker: $($m.product)" }
  return $m
}
function Stop-Runtime([string]$Root) {
  $stop=Join-Path $Root 'scripts\Stop-LocalRuntime.ps1'
  if(Test-Path $stop){ & $stop -Port $Port | Out-Null }
  if(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue){
    throw "Port $Port remains open after stop."
  }
}

function Move-DirectoryWithRetry([string]$Source,[string]$Destination) {
  $last=$null
  for($i=0;$i -lt 20;$i++){
    try { Move-Item -LiteralPath $Source -Destination $Destination; return }
    catch { $last=$_; Start-Sleep -Milliseconds 250 }
  }
  throw "Directory move failed after quiescence retries: $Source -> $Destination :: $($last.Exception.Message)"
}

function Test-Runtime([string]$Root) {
  $start=Join-Path $Root 'scripts\Start-LocalRuntime.ps1'
  $stop=Join-Path $Root 'scripts\Stop-LocalRuntime.ps1'
  & $start -Port $Port | Out-Null
  try {
    $h=Invoke-RestMethod -Uri ("http://127.0.0.1:{0}/health" -f $Port) -TimeoutSec 3
    if($h.status -ne 'ok' -or $h.adapterId -ne $ExpectedAdapter -or $h.host -ne '127.0.0.1'){
      throw 'Rollback health identity mismatch.'
    }
    $b=Invoke-RestMethod -Uri ("http://127.0.0.1:{0}/gp-test-001/baseline" -f $Port) -TimeoutSec 3
    if($b.totalWater -ne 12000000){ throw 'Rollback baseline Water mismatch.' }
    1..14 | ForEach-Object {
      $id=('GPF-{0:D3}' -f $_)
      $r=Invoke-RestMethod -Uri ("http://127.0.0.1:{0}/gp-test-001/scenarios/{1}" -f $Port,$id) -Method Post -TimeoutSec 5
      if(-not $r.pass){ throw "Rollback canary failed: $id" }
    }
    return [ordered]@{ health=$h; baselineHash=$b.hash; canaries=14 }
  } finally {
    & $stop -Port $Port | Out-Null
  }
}

$current=Join-Path $ParentRoot 'current'
$previous=Join-Path $ParentRoot 'previous'
$currentMarker=Read-Marker $current
$previousMarker=Read-Marker $previous
if($currentMarker.version -eq $previousMarker.version -and $currentMarker.sourceCommit -eq $previousMarker.sourceCommit){
  throw 'Current and previous are identical; rollback would not change state.'
}
Stop-Runtime $current

$hold=Join-Path $ParentRoot ('.rollback-current-'+[guid]::NewGuid().ToString('N'))
$failed=Join-Path $ParentRoot ('.rollback-failed-'+[guid]::NewGuid().ToString('N'))

try {
  Move-DirectoryWithRetry $current $hold
  Move-DirectoryWithRetry $previous $current

  try {
    $proof=Test-Runtime $current
  } catch {
    Stop-Runtime $current
    Move-DirectoryWithRetry $current $failed
    Move-DirectoryWithRetry $hold $current
    Move-DirectoryWithRetry $failed $previous
    $restoreProof=Test-Runtime $current
    & $HistoryWriter -ParentRoot $ParentRoot -Entry @{
      action='MANUAL_ROLLBACK_RESTORED_CURRENT'
      result='PASS'
      fromVersion=$currentMarker.version
      attemptedVersion=$previousMarker.version
      restoredVersion=$currentMarker.version
      baselineHash=$restoreProof.baselineHash
      canaries=$restoreProof.canaries
      reason=$_.Exception.Message
    } | Out-Null
    throw "ROLLBACK_REJECTED_RESTORED_CURRENT: $($_.Exception.Message)"
  }

  Move-DirectoryWithRetry $hold $previous
  & $HistoryWriter -ParentRoot $ParentRoot -Entry @{
    action='MANUAL_ROLLBACK_PASS'
    result='PASS'
    fromVersion=$currentMarker.version
    toVersion=$previousMarker.version
    sourceCommit=$previousMarker.sourceCommit
    baselineHash=$proof.baselineHash
    canaries=$proof.canaries
  } | Out-Null
  [pscustomobject]@{
    result='ROLLED_BACK'
    fromVersion=$currentMarker.version
    toVersion=$previousMarker.version
    currentRoot=$current
    previousRoot=$previous
    baselineHash=$proof.baselineHash
    canaries=$proof.canaries
  } | ConvertTo-Json -Compress
} finally {
  if(Test-Path $hold){
    throw "Rollback hold directory remains and requires operator review: $hold"
  }
  if(Test-Path $failed){
    throw "Rollback failed-candidate directory remains and requires operator review: $failed"
  }
}
