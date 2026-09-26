param(
  [string]$Version = '0.1.0',
  [string]$OutputDir
)
$ErrorActionPreference='Stop'
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
if(-not $OutputDir){ $OutputDir = Join-Path $RepoRoot 'artifacts' }
$BuildRoot = Join-Path $RepoRoot '.installer-build'
$Payload = Join-Path $BuildRoot 'payload'
$InstallerSource = Join-Path $RepoRoot 'packaging\installer'
$RuntimeSource = Join-Path $RepoRoot 'packaging\runtime'
$NodeExe = (Get-Command node.exe).Source
$SourceCommit = (git -C $RepoRoot rev-parse HEAD).Trim()

if(Test-Path $BuildRoot){ Remove-Item $BuildRoot -Recurse -Force }
New-Item -ItemType Directory -Force $Payload,$OutputDir | Out-Null
New-Item -ItemType Directory -Force (Join-Path $Payload 'runtime'),(Join-Path $Payload 'app\adapter'),(Join-Path $Payload 'app\pyramid'),(Join-Path $Payload 'scripts') | Out-Null

Push-Location $RepoRoot
try { npm run build | Out-Host } finally { Pop-Location }

Copy-Item $NodeExe (Join-Path $Payload 'runtime\node.exe')
Copy-Item (Join-Path $RepoRoot 'dist\src\adapter\local-runtime-adapter-entry.js') (Join-Path $Payload 'app\adapter\')
Copy-Item (Join-Path $RepoRoot 'dist\src\adapter\local-runtime-adapter.js') (Join-Path $Payload 'app\adapter\')
Copy-Item (Join-Path $RepoRoot 'dist\src\pyramid\gp-test-001.js') (Join-Path $Payload 'app\pyramid\')

@'
{"type":"module"}
'@ | Set-Content -Path (Join-Path $Payload 'app\package.json') -Encoding UTF8

$scriptFiles = @(
  'Start-LocalRuntime.ps1',
  'Stop-LocalRuntime.ps1',
  'Health-LocalRuntime.ps1',
  'Uninstall-LocalRuntime.ps1'
)
foreach($f in $scriptFiles){ Copy-Item (Join-Path $RuntimeSource $f) (Join-Path $Payload 'scripts\') }

$launcherFiles = @(
  'Start FOTN Local Runtime.cmd',
  'Stop FOTN Local Runtime.cmd',
  'Check FOTN Local Runtime.cmd',
  'Uninstall FOTN Local Runtime.cmd'
)
foreach($f in $launcherFiles){ Copy-Item (Join-Path $RuntimeSource $f) (Join-Path $Payload $f) }

$nodeHash=(Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $Payload 'runtime\node.exe')).Hash.ToLowerInvariant()
$nodeVersion=& $NodeExe --version
$installMarker=[ordered]@{
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
$installMarker | ConvertTo-Json -Depth 5 | Set-Content -Path (Join-Path $Payload 'FOTN_LOCAL_RUNTIME_INSTALL.json') -Encoding UTF8

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
  packageFormat='iexp-self-extracting'
  files=$files
}
$manifest | ConvertTo-Json -Depth 8 | Set-Content -Path (Join-Path $Payload 'manifest.json') -Encoding UTF8

$zip=Join-Path $BuildRoot 'payload.zip'
Compress-Archive -Path (Join-Path $Payload '*') -DestinationPath $zip -CompressionLevel Optimal

Copy-Item (Join-Path $InstallerSource 'Install.cmd') (Join-Path $BuildRoot 'Install.cmd')
Copy-Item (Join-Path $InstallerSource 'Install-FOTNLocalRuntime.ps1') (Join-Path $BuildRoot 'Install-FOTNLocalRuntime.ps1')

$target=Join-Path $OutputDir ("FOTN-Local-Runtime-Adapter-Setup-v{0}.exe" -f $Version)
if(Test-Path $target){ Remove-Item -LiteralPath $target -Force }
Get-ChildItem $OutputDir -Filter ('~FOTN-Local-Runtime-Adapter-Setup-v'+$Version+'*') -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
$sed=Join-Path $BuildRoot 'installer.sed'
$sourceWithSlash=$BuildRoot.TrimEnd('\')+'\'
$sedText=@"
[Version]
Class=IEXPRESS
SEDVersion=3
[Options]
PackagePurpose=InstallApp
ShowInstallProgramWindow=1
HideExtractAnimation=0
UseLongFileName=1
InsideCompressed=0
CAB_FixedSize=0
CAB_ResvCodeSigning=0
RebootMode=N
InstallPrompt=%InstallPrompt%
DisplayLicense=
FinishMessage=
TargetName=%TargetName%
FriendlyName=%FriendlyName%
AppLaunched=%AppLaunched%
PostInstallCmd=<None>
AdminQuietInstCmd=%AppLaunched%
UserQuietInstCmd=%AppLaunched%
SourceFiles=SourceFiles
[Strings]
InstallPrompt=
FinishMessage=FOTN Local Runtime Adapter installation completed.
TargetName="$target"
FriendlyName=FOTN Local Runtime Adapter Setup
AppLaunched="Install.cmd"
FILE0="payload.zip"
FILE1="Install.cmd"
FILE2="Install-FOTNLocalRuntime.ps1"
[SourceFiles]
SourceFiles0="$sourceWithSlash"
[SourceFiles0]
%FILE0%=
%FILE1%=
%FILE2%=
"@
$sedText | Set-Content -Path $sed -Encoding ASCII

$iexpress=Join-Path $env:WINDIR 'System32\iexpress.exe'
if(!(Test-Path $iexpress)){ throw 'IExpress is not available on this Windows host.' }
if(-not $env:TMP){ $env:TMP=$env:TEMP }
$iex = Start-Process -FilePath $iexpress -ArgumentList @('/N','/Q',$sed) -Wait -PassThru
if($iex.ExitCode -ne 0){ throw "IExpress failed with exit code $($iex.ExitCode)" }
if(!(Test-Path $target)){ throw "Installer was not created: $target" }

$result=[ordered]@{
  installer=$target
  installerSha256=(Get-FileHash -Algorithm SHA256 -LiteralPath $target).Hash.ToLowerInvariant()
  installerBytes=(Get-Item $target).Length
  payloadZipSha256=(Get-FileHash -Algorithm SHA256 -LiteralPath $zip).Hash.ToLowerInvariant()
  sourceCommit=$SourceCommit
  version=$Version
  bundledNodeVersion=$nodeVersion
  bundledNodeSha256=$nodeHash
}
$result | ConvertTo-Json -Depth 5 | Set-Content -Path (Join-Path $OutputDir 'FOTN-Local-Runtime-Adapter-Setup-build.json') -Encoding UTF8
$result | ConvertTo-Json -Compress
