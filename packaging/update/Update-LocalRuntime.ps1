param(
  [string]$PackagePath,
  [string]$InstallRoot = (Join-Path $env:LOCALAPPDATA 'FOTN\LocalRuntimeAdapter\current'),
  [int]$Port = 24701
)
$ErrorActionPreference='Stop'
$Product='FOTN Local Runtime Adapter'
$ExpectedAdapter='LOCAL-RUNTIME-ADAPTER-001'

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
function Test-Runtime([string]$Root) {
  $start=Join-Path $Root 'scripts\Start-LocalRuntime.ps1'
  $stop=Join-Path $Root 'scripts\Stop-LocalRuntime.ps1'
  & $start -Port $Port | Out-Null
  try {
    $h=Invoke-RestMethod -Uri ("http://127.0.0.1:{0}/health" -f $Port) -TimeoutSec 3
    if($h.status -ne 'ok' -or $h.adapterId -ne $ExpectedAdapter -or $h.host -ne '127.0.0.1'){
      throw 'Update health identity mismatch.'
    }
    $b=Invoke-RestMethod -Uri ("http://127.0.0.1:{0}/gp-test-001/baseline" -f $Port) -TimeoutSec 3
    if($b.totalWater -ne 12000000){ throw 'Update baseline Water mismatch.' }
    1..14 | ForEach-Object {
      $id=('GPF-{0:D3}' -f $_)
      $r=Invoke-RestMethod -Uri ("http://127.0.0.1:{0}/gp-test-001/scenarios/{1}" -f $Port,$id) -Method Post -TimeoutSec 5
      if(-not $r.pass){ throw "Update canary failed: $id" }
    }
    return [ordered]@{ health=$h; baselineHash=$b.hash; canaries=14 }
  } finally {
    & $stop -Port $Port | Out-Null
  }
}
if(-not $PackagePath){
  $downloads=Join-Path $env:USERPROFILE 'Downloads'
  $candidate=Get-ChildItem $downloads -Filter 'FOTN-Local-Runtime-Update-v*.zip' -File -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if(-not $candidate){ throw 'No FOTN local runtime update package found in Downloads.' }
  $PackagePath=$candidate.FullName
}
$PackagePath=(Resolve-Path $PackagePath).Path
$current=Read-Marker $InstallRoot
$parent=Split-Path -Parent $InstallRoot
$previous=Join-Path $parent 'previous'
$extract=Join-Path $parent ('.update-extract-'+[guid]::NewGuid().ToString('N'))
$stage=Join-Path $parent ('.update-stage-'+[guid]::NewGuid().ToString('N'))

try {
  Expand-Archive -LiteralPath $PackagePath -DestinationPath $extract -Force
  $manifestPath=Join-Path $extract 'update-manifest.json'
  if(!(Test-Path $manifestPath)){ throw 'Update manifest missing.' }
  $manifest=Get-Content $manifestPath -Raw | ConvertFrom-Json
  if($manifest.product -ne $Product -or $manifest.adapterId -ne $ExpectedAdapter){ throw 'Update identity mismatch.' }
  if($manifest.version -eq $current.version){ throw "Update version equals installed version: $($current.version)" }
  $payload=Join-Path $extract 'payload'
  if(!(Test-Path $payload)){ throw 'Update payload missing.' }
  foreach($entry in $manifest.files){
    $f=Join-Path $payload $entry.path
    if(!(Test-Path $f)){ throw "Update file missing: $($entry.path)" }
    $h=(Get-FileHash -Algorithm SHA256 -LiteralPath $f).Hash.ToLowerInvariant()
    if($h -ne $entry.sha256){ throw "Update hash mismatch: $($entry.path)" }
  }
  Copy-Item -LiteralPath $payload -Destination $stage -Recurse
  $staged=Read-Marker $stage
  if($staged.version -ne $manifest.version -or $staged.sourceCommit -ne $manifest.sourceCommit){
    throw 'Staged marker does not match update manifest.'
  }

  Stop-Runtime $InstallRoot
  if(Test-Path $previous){
    $pm=Read-Marker $previous
    Remove-Item -LiteralPath $previous -Recurse -Force
  }
  Move-Item -LiteralPath $InstallRoot -Destination $previous
  Move-Item -LiteralPath $stage -Destination $InstallRoot

  try {
    $proof=Test-Runtime $InstallRoot
  } catch {
    Stop-Runtime $InstallRoot
    Remove-Item -LiteralPath $InstallRoot -Recurse -Force -ErrorAction SilentlyContinue
    Move-Item -LiteralPath $previous -Destination $InstallRoot
    $rollbackProof=Test-Runtime $InstallRoot
    throw "UPDATE_ROLLED_BACK: $($_.Exception.Message)"
  }
  [pscustomobject]@{
    result='UPDATED'
    fromVersion=$current.version
    toVersion=$manifest.version
    sourceCommit=$manifest.sourceCommit
    baselineHash=$proof.baselineHash
    canaries=$proof.canaries
    previousRoot=$previous
    currentRoot=$InstallRoot
  } | ConvertTo-Json -Compress
} finally {
  if(Test-Path $extract){ Remove-Item -LiteralPath $extract -Recurse -Force -ErrorAction SilentlyContinue }
  if(Test-Path $stage){ Remove-Item -LiteralPath $stage -Recurse -Force -ErrorAction SilentlyContinue }
}
