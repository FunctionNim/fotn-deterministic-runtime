param()
$ErrorActionPreference='Stop'
$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
$Zip = Join-Path $Here 'payload.zip'
if(!(Test-Path $Zip)){ throw 'payload.zip missing from installer.' }

$defaultRoot = Join-Path $env:LOCALAPPDATA 'FOTN\LocalRuntimeAdapter\current'
$InstallRoot = if($env:FOTN_INSTALL_ROOT){ $env:FOTN_INSTALL_ROOT } else { $defaultRoot }
$NoShortcut = $env:FOTN_NO_SHORTCUT -eq '1'
$Parent = Split-Path -Parent $InstallRoot
$Stage = Join-Path $Parent ('.stage-'+[guid]::NewGuid().ToString('N'))
$Backup = Join-Path $Parent ('.backup-'+[guid]::NewGuid().ToString('N'))

New-Item -ItemType Directory -Force $Parent | Out-Null
try {
  Expand-Archive -LiteralPath $Zip -DestinationPath $Stage -Force
  $manifestPath = Join-Path $Stage 'manifest.json'
  if(!(Test-Path $manifestPath)){ throw 'Payload manifest missing.' }
  $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
  if($manifest.product -ne 'FOTN Local Runtime Adapter'){ throw 'Unexpected payload product.' }
  foreach($entry in $manifest.files){
    $file = Join-Path $Stage $entry.path
    if(!(Test-Path $file)){ throw "Manifest file missing: $($entry.path)" }
    $actual = (Get-FileHash -Algorithm SHA256 -LiteralPath $file).Hash.ToLowerInvariant()
    if($actual -ne $entry.sha256){ throw "Hash mismatch: $($entry.path)" }
  }

  if(Test-Path $InstallRoot){
    Move-Item -LiteralPath $InstallRoot -Destination $Backup
  }
  Move-Item -LiteralPath $Stage -Destination $InstallRoot

  if(-not $NoShortcut){
    $desktop=[Environment]::GetFolderPath('Desktop')
    $shortcutPath=Join-Path $desktop 'FOTN Local Runtime.lnk'
    $ws=New-Object -ComObject WScript.Shell
    $sc=$ws.CreateShortcut($shortcutPath)
    $sc.TargetPath=Join-Path $InstallRoot 'Start FOTN Local Runtime.cmd'
    $sc.WorkingDirectory=$InstallRoot
    $sc.Description='Start FOTN Local Runtime Adapter'
    $sc.Save()
  }

  if(Test-Path $Backup){ Remove-Item -LiteralPath $Backup -Recurse -Force }
  Write-Output "FOTN_LOCAL_RUNTIME_INSTALLED root=$InstallRoot version=$($manifest.version)"
} catch {
  if((Test-Path $InstallRoot) -and (Test-Path $Backup)){
    Remove-Item -LiteralPath $InstallRoot -Recurse -Force -ErrorAction SilentlyContinue
    Move-Item -LiteralPath $Backup -Destination $InstallRoot
  } elseif(Test-Path $Backup){
    Move-Item -LiteralPath $Backup -Destination $InstallRoot
  }
  if(Test-Path $Stage){ Remove-Item -LiteralPath $Stage -Recurse -Force -ErrorAction SilentlyContinue }
  throw
}
