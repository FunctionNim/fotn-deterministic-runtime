$ErrorActionPreference='Stop'
$InstallRoot = Split-Path -Parent $PSScriptRoot
$Marker = Join-Path $InstallRoot 'FOTN_LOCAL_RUNTIME_INSTALL.json'
if(!(Test-Path $Marker)){ throw "Refusing uninstall: installation marker missing." }
& (Join-Path $PSScriptRoot 'Stop-LocalRuntime.ps1') | Out-Null
$expected = (Get-Content $Marker -Raw | ConvertFrom-Json).product
if($expected -ne 'FOTN Local Runtime Adapter'){ throw "Refusing uninstall: unexpected product marker." }
$parent=Split-Path -Parent $InstallRoot
$leaf=Split-Path -Leaf $InstallRoot
$cleanup=Join-Path $env:TEMP ('fotn-uninstall-'+[guid]::NewGuid().ToString('N')+'.ps1')
@"
Start-Sleep -Milliseconds 500
Remove-Item -LiteralPath '$InstallRoot' -Recurse -Force
"@ | Set-Content -Path $cleanup -Encoding UTF8
Start-Process powershell.exe -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',$cleanup) -WindowStyle Hidden | Out-Null
Write-Output "FOTN_LOCAL_RUNTIME_UNINSTALL_SCHEDULED root=$InstallRoot"
