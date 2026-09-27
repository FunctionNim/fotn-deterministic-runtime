param(
  [string]$Version = '0.1.1',
  [ValidateSet('None','BadHealth')][string]$FaultMode = 'None',
  [string]$OutputDir
)
$ErrorActionPreference='Stop'
$RepoRoot=(Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
if(-not $OutputDir){ $OutputDir=Join-Path $RepoRoot 'artifacts' }
$BuildRoot=Join-Path $RepoRoot ('.update-build-'+$Version+'-'+$FaultMode)
$Payload=Join-Path $BuildRoot 'payload'
$RuntimeSource=Join-Path $RepoRoot 'packaging\runtime'
$UpdateSource=Join-Path $RepoRoot 'packaging\update'
$NodeExe=(Get-Command node.exe).Source
$SourceCommit=(git -C $RepoRoot rev-parse HEAD).Trim()

if(Test-Path $BuildRoot){ Remove-Item $BuildRoot -Recurse -Force }
New-Item -ItemType Directory -Force $Payload,$OutputDir | Out-Null
New-Item -ItemType Directory -Force (Join-Path $Payload 'runtime'),(Join-Path $Payload 'app\adapter'),(Join-Path $Payload 'app\pyramid'),(Join-Path $Payload 'scripts') | Out-Null
Push-Location $RepoRoot
try { npm run build | Out-Host } finally { Pop-Location }
Copy-Item $NodeExe (Join-Path $Payload 'runtime\node.exe')
Copy-Item (Join-Path $RepoRoot 'dist\src\adapter\local-runtime-adapter-entry.js') (Join-Path $Payload 'app\adapter\')
Copy-Item (Join-Path $RepoRoot 'dist\src\adapter\local-runtime-adapter.js') (Join-Path $Payload 'app\adapter\')
Copy-Item (Join-Path $RepoRoot 'dist\src\pyramid\gp-test-001.js') (Join-Path $Payload 'app\pyramid\')
'{"type":"module"}' | Set-Content -Path (Join-Path $Payload 'app\package.json') -Encoding UTF8

foreach($f in @('Start-LocalRuntime.ps1','Stop-LocalRuntime.ps1','Health-LocalRuntime.ps1','Uninstall-LocalRuntime.ps1')){
  Copy-Item (Join-Path $RuntimeSource $f) (Join-Path $Payload 'scripts\')
}
foreach($f in @('Start FOTN Local Runtime.cmd','Stop FOTN Local Runtime.cmd','Check FOTN Local Runtime.cmd','Uninstall FOTN Local Runtime.cmd')){
  Copy-Item (Join-Path $RuntimeSource $f) (Join-Path $Payload $f)
}

if($FaultMode -eq 'BadHealth'){
  $adapter=Join-Path $Payload 'app\adapter\local-runtime-adapter.js'
  (Get-Content $adapter -Raw).Replace('LOCAL-RUNTIME-ADAPTER-001','BROKEN-RUNTIME-ADAPTER-001') | Set-Content $adapter -Encoding UTF8
}
$nodeHash=(Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $Payload 'runtime\node.exe')).Hash.ToLowerInvariant()
$nodeVersion=& $NodeExe --version
$marker=[ordered]@{
  product='FOTN Local Runtime Adapter'
  version=$Version
  sourceCommit=$SourceCommit
  adapterId='LOCAL-RUNTIME-ADAPTER-001'
  qualifiedBaseCommit='9e633eb1459b5cf0a00fcc9d58bdd15f69a27871'
  defaultHost='127.0.0.1'
  defaultPort=24701
  bundledNodeVersion=$nodeVersion
  bundledNodeSha256=$nodeHash
}
$marker | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $Payload 'FOTN_LOCAL_RUNTIME_INSTALL.json') -Encoding UTF8

$files=@()
Get-ChildItem $Payload -File -Recurse | Sort-Object FullName | ForEach-Object {
  $relative=$_.FullName.Substring($Payload.Length+1).Replace('\','/')
  $files += [ordered]@{
    path=$relative
    sha256=(Get-FileHash -Algorithm SHA256 -LiteralPath $_.FullName).Hash.ToLowerInvariant()
    bytes=$_.Length
  }
}
$manifest=[ordered]@{
  product='FOTN Local Runtime Adapter'
  version=$Version
  sourceCommit=$SourceCommit
  adapterId='LOCAL-RUNTIME-ADAPTER-001'
  faultMode=$FaultMode
  files=$files
}
$manifest | ConvertTo-Json -Depth 8 | Set-Content (Join-Path $BuildRoot 'update-manifest.json') -Encoding UTF8

$zipName=if($FaultMode -eq 'None'){
  "FOTN-Local-Runtime-Update-v$Version.zip"
}else{
  "FOTN-Local-Runtime-Update-v$Version-$FaultMode.zip"
}
$zip=Join-Path $OutputDir $zipName
if(Test-Path $zip){ Remove-Item $zip -Force }
$archiveRoot=Join-Path $BuildRoot 'archive'
New-Item -ItemType Directory -Force $archiveRoot | Out-Null
Copy-Item -LiteralPath $Payload -Destination (Join-Path $archiveRoot 'payload') -Recurse
Copy-Item (Join-Path $BuildRoot 'update-manifest.json') (Join-Path $archiveRoot 'update-manifest.json')
Compress-Archive -Path (Join-Path $archiveRoot '*') -DestinationPath $zip -CompressionLevel Optimal
$result=[ordered]@{
  updatePackage=$zip
  sha256=(Get-FileHash -Algorithm SHA256 -LiteralPath $zip).Hash.ToLowerInvariant()
  bytes=(Get-Item $zip).Length
  version=$Version
  sourceCommit=$SourceCommit
  faultMode=$FaultMode
  bundledNodeVersion=$nodeVersion
  bundledNodeSha256=$nodeHash
}
$resultPath=Join-Path $OutputDir ("FOTN-Local-Runtime-Update-v{0}-{1}-build.json" -f $Version,$FaultMode)
$result | ConvertTo-Json -Depth 5 | Set-Content $resultPath -Encoding UTF8
$result | ConvertTo-Json -Compress
