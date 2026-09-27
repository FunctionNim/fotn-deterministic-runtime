param(
  [string]$ParentRoot = (Join-Path $env:LOCALAPPDATA 'FOTN\LocalRuntimeAdapter'),
  [int]$Port = 24701
)
$ErrorActionPreference='Stop'
$Product='FOTN Local Runtime Adapter'

function Read-MarkerSafe([string]$Root) {
  $path=Join-Path $Root 'FOTN_LOCAL_RUNTIME_INSTALL.json'
  if(!(Test-Path $path)){ return $null }
  try {
    $m=Get-Content $path -Raw | ConvertFrom-Json
    if($m.product -ne $Product){ return $null }
    return $m
  } catch { return $null }
}
$current=Read-MarkerSafe (Join-Path $ParentRoot 'current')
$previous=Read-MarkerSafe (Join-Path $ParentRoot 'previous')
$listener=Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
$runtimeState=if($listener -and @($listener | Where-Object {$_.LocalAddress -eq '127.0.0.1'}).Count -gt 0){'RUNNING'}else{'STOPPED'}

$ledger=Join-Path $ParentRoot 'history\update-history.ndjson'
$last=$null
if(Test-Path $ledger){
  $tail=Get-Content -LiteralPath $ledger -Tail 1 -ErrorAction SilentlyContinue
  if($tail){
    try { $last=$tail | ConvertFrom-Json } catch {}
  }
}

$sigTool=Get-ChildItem 'C:\Program Files (x86)\Windows Kits\10\bin' -Filter signtool.exe -Recurse -ErrorAction SilentlyContinue |
  Where-Object {$_.FullName -like '*\x64\signtool.exe'} |
  Sort-Object FullName -Descending | Select-Object -First 1
$certs=@(Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert -ErrorAction SilentlyContinue | Where-Object {$_.HasPrivateKey -and $_.NotAfter -gt (Get-Date)})
$signing=if(-not $sigTool){'SIGNTOOL_MISSING'}elseif($certs.Count -eq 0){'CERTIFICATE_REQUIRED'}else{'READY'}
$status=[ordered]@{
  Product=$Product
  Installed=if($current){$current.version}else{'MISSING'}
  InstalledSource=if($current){$current.sourceCommit}else{'MISSING'}
  Previous=if($previous){$previous.version}else{'NONE'}
  PreviousSource=if($previous){$previous.sourceCommit}else{'NONE'}
  Runtime=$runtimeState
  Host='127.0.0.1'
  Port=$Port
  LastAction=if($last){$last.action}else{'NONE'}
  LastResult=if($last){$last.result}else{'NONE'}
  LastCanaries=if($last -and $null -ne $last.canaries){$last.canaries}else{'NONE'}
  LastBaselineHash=if($last -and $last.baselineHash){$last.baselineHash}else{'NONE'}
  LastTimestampUtc=if($last){$last.timestampUtc}else{'NONE'}
  Signing=$signing
}

Write-Output ''
Write-Output '=== FOTN LOCAL RUNTIME STATUS ==='
$status.GetEnumerator() | ForEach-Object { Write-Output ("{0,-18}: {1}" -f $_.Key,$_.Value) }
Write-Output '================================='
