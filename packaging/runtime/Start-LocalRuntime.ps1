param(
  [int]$Port = 24701
)
$ErrorActionPreference='Stop'
$InstallRoot = Split-Path -Parent $PSScriptRoot
$Node = Join-Path $InstallRoot 'runtime\node.exe'
$Entry = Join-Path $InstallRoot 'app\adapter\local-runtime-adapter-entry.js'
$RunDir = Join-Path $InstallRoot 'run'
$LogDir = Join-Path $InstallRoot 'logs'
$PidFile = Join-Path $RunDir 'adapter.pid'
New-Item -ItemType Directory -Force $RunDir,$LogDir | Out-Null

if(!(Test-Path $Node)){ throw "Bundled node.exe missing: $Node" }
if(!(Test-Path $Entry)){ throw "Adapter entrypoint missing: $Entry" }

if(Test-Path $PidFile){
  $oldPid = [int](Get-Content $PidFile -Raw).Trim()
  $old = Get-Process -Id $oldPid -ErrorAction SilentlyContinue
  if($old){
    try {
      $health = Invoke-RestMethod -Uri ("http://127.0.0.1:{0}/health" -f $Port) -TimeoutSec 2
      if($health.adapterId -eq 'LOCAL-RUNTIME-ADAPTER-001'){
        Write-Output "FOTN_LOCAL_RUNTIME_ALREADY_RUNNING pid=$oldPid port=$Port"
        exit 0
      }
    } catch {}
    throw "PID file points to a running process that is not a healthy qualified adapter: $oldPid"
  }
  Remove-Item $PidFile -Force
}

$env:FOTN_LOCAL_ADAPTER_PORT = [string]$Port
$outLog = Join-Path $LogDir 'adapter.out.log'
$errLog = Join-Path $LogDir 'adapter.err.log'
$p = Start-Process -FilePath $Node -ArgumentList @($Entry) -WorkingDirectory $InstallRoot -PassThru -WindowStyle Hidden -RedirectStandardOutput $outLog -RedirectStandardError $errLog
Set-Content -Path $PidFile -Value $p.Id -NoNewline

$ready=$false
for($i=0;$i -lt 40;$i++){
  Start-Sleep -Milliseconds 250
  if($p.HasExited){ break }
  try {
    $health=Invoke-RestMethod -Uri ("http://127.0.0.1:{0}/health" -f $Port) -TimeoutSec 1
    if($health.adapterId -eq 'LOCAL-RUNTIME-ADAPTER-001' -and $health.host -eq '127.0.0.1'){
      $ready=$true; break
    }
  } catch {}
}
if(-not $ready){
  if(-not $p.HasExited){ Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue }
  Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
  throw "Local runtime adapter failed health qualification. Check $errLog"
}
Write-Output ("FOTN_LOCAL_RUNTIME_READY pid={0} port={1}" -f $p.Id,$Port)
