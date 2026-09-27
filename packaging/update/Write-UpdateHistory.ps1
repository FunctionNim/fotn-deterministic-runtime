param(
  [Parameter(Mandatory=$true)][hashtable]$Entry,
  [string]$ParentRoot = (Join-Path $env:LOCALAPPDATA 'FOTN\LocalRuntimeAdapter')
)
$ErrorActionPreference='Stop'
$historyDir=Join-Path $ParentRoot 'history'
$ledger=Join-Path $historyDir 'update-history.ndjson'
New-Item -ItemType Directory -Force $historyDir | Out-Null
$ordered=[ordered]@{
  timestampUtc=(Get-Date).ToUniversalTime().ToString('o')
}
foreach($k in $Entry.Keys | Sort-Object){
  $ordered[$k]=$Entry[$k]
}
$line=$ordered | ConvertTo-Json -Compress -Depth 8
Add-Content -LiteralPath $ledger -Value $line -Encoding UTF8
Write-Output $ledger
