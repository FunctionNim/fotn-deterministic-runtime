param([int]$Port = 24701)
$ErrorActionPreference='Stop'
$InstallRoot = Split-Path -Parent $PSScriptRoot
$PidFile = Join-Path $InstallRoot 'run\adapter.pid'
if(Test-Path $PidFile){
  $pidValue = [int](Get-Content $PidFile -Raw).Trim()
  $p = Get-Process -Id $pidValue -ErrorAction SilentlyContinue
  if($p){
    Stop-Process -Id $pidValue -Force
    for($i=0;$i -lt 20;$i++){
      Start-Sleep -Milliseconds 250
      if(-not (Get-Process -Id $pidValue -ErrorAction SilentlyContinue)){ break }
    }
  }
  Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
}
$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if($listener){
  throw "Port $Port is still listening after stop."
}
Write-Output ("FOTN_LOCAL_RUNTIME_STOPPED port={0}" -f $Port)
