param(
  [int]$Port = 24701,
  [switch]$NoBrowser
)
$ErrorActionPreference='Stop'
$ParentRoot=$PSScriptRoot
$Current=Join-Path $ParentRoot 'current'
$StartRuntime=Join-Path $Current 'scripts\Start-LocalRuntime.ps1'
if(!(Test-Path $StartRuntime)){ throw "Qualified runtime start script missing: $StartRuntime" }

& $StartRuntime -Port $Port | Out-Null

$uri=("http://127.0.0.1:{0}/pressurebound/consumer/handshake" -f $Port)
$handshake=$null
for($i=0;$i -lt 20;$i++){
  try {
    $handshake=Invoke-RestMethod -Uri $uri -Method Get -TimeoutSec 2
    if($handshake.status -eq 'ok' -and $handshake.buildVerified){ break }
  } catch {}
  Start-Sleep -Milliseconds 250
}
if(-not $handshake -or $handshake.status -ne 'ok' -or -not $handshake.buildVerified){
  throw 'PRESSUREBOUND consumer handshake did not reach qualified PASS.'
}
if($handshake.runtimeConnection -ne 'LOCALHOST_SAME_ORIGIN'){
  throw "Unexpected runtime connection: $($handshake.runtimeConnection)"
}
$game=("http://127.0.0.1:{0}/pressurebound/" -f $Port)
if(-not $NoBrowser){ Start-Process $game }
Write-Output ("PRESSUREBOUND_LOCAL_READY url={0} deployment={1} authority={2}" -f $game,$handshake.deploymentId,$handshake.gameplayAuthority)
